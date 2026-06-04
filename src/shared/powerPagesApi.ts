/**
 * Power Pages Web API — shared fetch client
 *
 * Handles:
 *   - Anti-forgery token: fetched once from /_layout/tokenhtml, cached in memory,
 *     refreshed automatically when the server returns error code 0x90040107.
 *   - Retry: exponential back-off on 429 / 5xx (max 3 attempts).
 *   - 401 → throws "Session expired" immediately, no retry.
 *   - 403 → if error code is 0x90040107 (anti-forgery), invalidates the cached token
 *     and retries; otherwise throws a permission error without retry.
 *   - OData helpers: buildODataUrl, escapeODataString, parseListResponse.
 */

// ---------------------------------------------------------------------------
// Error types & codes
// ---------------------------------------------------------------------------

/** Hex error codes returned by the Power Pages Web API in 4xx response bodies. */
export const WebApiErrorCode = {
  /** Anti-forgery token is missing, invalid, or expired. */
  AntiForgeryTokenInvalid: 0x90040107, // 2416476423
  /** Record not found. */
  NotFound: 0x9004010c,
  /** Table permission: read access denied. */
  ReadDenied: 0x90040120,
  /** Table permission: write/update access denied. */
  WriteDenied: 0x90040102,
  /** Table permission: create access denied. */
  CreateDenied: 0x90040103,
  /** Table permission: delete access denied. */
  DeleteDenied: 0x90040104,
} as const;

export class WebApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly errorCode: number | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'WebApiError';
  }
}

/** Returns true when `err` is a WebApiError caused by a table permission denial. */
export function isPermissionError(err: unknown): boolean {
  if (!(err instanceof WebApiError)) return false;
  const { errorCode } = err;
  return (
    errorCode === WebApiErrorCode.ReadDenied ||
    errorCode === WebApiErrorCode.WriteDenied ||
    errorCode === WebApiErrorCode.CreateDenied ||
    errorCode === WebApiErrorCode.DeleteDenied
  );
}

// ---------------------------------------------------------------------------
// Anti-forgery token
// ---------------------------------------------------------------------------

let _cachedToken: string | null = null;

/** Fetches a fresh anti-forgery token from the Power Pages layout endpoint. */
async function fetchToken(): Promise<string> {
  const res = await fetch('/_layout/tokenhtml', { credentials: 'include' });
  if (!res.ok) {
    throw new WebApiError(res.status, undefined, 'Failed to fetch anti-forgery token.');
  }
  const html = await res.text();
  // The endpoint returns an <input … value="TOKEN" /> snippet
  const match = html.match(/value="([^"]+)"/);
  if (!match) throw new Error('Anti-forgery token not found in /_layout/tokenhtml response.');
  return match[1];
}

async function getToken(): Promise<string> {
  if (!_cachedToken) _cachedToken = await fetchToken();
  return _cachedToken;
}

function invalidateToken(): void {
  _cachedToken = null;
}

// ---------------------------------------------------------------------------
// OData URL builder
// ---------------------------------------------------------------------------

export interface ODataQueryOptions {
  /** Columns to include — always specify; never use wildcards. */
  select?: string[];
  /** OData $filter expression (use escapeODataString for user-supplied values). */
  filter?: string;
  /** e.g. "lpulga_name asc" */
  orderby?: string;
  /** Hard cap on total records returned. Do NOT use for page-by-page navigation —
   *  use Prefer: odata.maxpagesize + @odata.nextLink cursors instead. */
  top?: number;
  /** Include @odata.count in the response. */
  count?: boolean;
  /** $apply expression for groupBy / aggregate queries. */
  apply?: string;
  /** Opaque cursor token extracted from a previous @odata.nextLink URL. */
  skiptoken?: string;
}

/**
 * Builds a `/_api/<entitySet>?…` URL from structured query options.
 *
 * Supported Power Pages query params: $select, $filter, $orderby, $top, $count,
 * $apply, $skiptoken.  $skip is NOT supported and will be rejected by the server.
 */
export function buildODataUrl(entitySet: string, options: ODataQueryOptions = {}): string {
  const parts: string[] = [];
  if (options.select?.length) parts.push(`$select=${options.select.join(',')}`);
  if (options.filter)            parts.push(`$filter=${options.filter}`);
  if (options.orderby)           parts.push(`$orderby=${options.orderby}`);
  if (options.top !== undefined) parts.push(`$top=${options.top}`);
  if (options.count)             parts.push('$count=true');
  if (options.apply)             parts.push(`$apply=${options.apply}`);
  if (options.skiptoken)         parts.push(`$skiptoken=${encodeURIComponent(options.skiptoken)}`);
  const qs = parts.length ? `?${parts.join('&')}` : '';
  return `/_api/${entitySet}${qs}`;
}

/**
 * Escapes a value for safe use as a string literal inside an OData $filter.
 * Doubles single-quotes so they are not interpreted as string delimiters.
 *
 * @example
 *   `$filter=lpulga_name eq '${escapeODataString(userInput)}'`
 */
export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/** Shape of every /_api/<entitySet> collection response. */
export interface ODataListResponse<T> {
  value: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

/**
 * Parses a successful fetch Response as a typed OData list response.
 * Convenience wrapper that applies the generic type parameter to the JSON parse.
 */
export async function parseListResponse<T>(res: Response): Promise<ODataListResponse<T>> {
  return res.json() as Promise<ODataListResponse<T>>;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Attempts to extract the numeric error code from a non-2xx OData response body. */
async function parseErrorCode(res: Response): Promise<number | undefined> {
  try {
    const body = await res.clone().json() as { error?: { code?: string } };
    const raw = body?.error?.code;
    if (!raw) return undefined;
    // Power Pages returns codes as "0x90040107" — parseInt handles the 0x prefix.
    return parseInt(raw, 16);
  } catch {
    return undefined;
  }
}

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** JSON string or raw ArrayBuffer (for binary file uploads). */
  body?: string | ArrayBuffer;
  /** Extra headers merged on top of the default OData headers. */
  headers?: Record<string, string>;
  /**
   * When true, skips fetching and attaching the anti-forgery token.
   * The server only validates the token on mutating requests (POST/PATCH/PUT/DELETE).
   * Safe to use — and slightly more efficient — on GET requests.
   * Default: false (token is always sent for simplicity on mutations).
   */
  skipToken?: boolean;
}

/**
 * Authenticated fetch wrapper for the Power Pages `/_api/` endpoint.
 *
 * • Attaches OData version headers and the anti-forgery CSRF token.
 * • Retries 429 and 5xx responses with exponential back-off.
 * • On 403 with anti-forgery error code, refreshes the token and retries.
 * • Throws WebApiError for all non-2xx responses after retries are exhausted.
 */
export async function powerPagesFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { method = 'GET', body, headers: extraHeaders = {}, skipToken = false } = options;

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    const token = skipToken ? '' : await getToken();

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      ...extraHeaders,
    };
    if (token) headers['__RequestVerificationToken'] = token;

    const res = await fetch(url, { method, headers, credentials: 'include', body });

    // 401 — session expired; do not retry, the user must re-authenticate
    if (res.status === 401) {
      throw new WebApiError(
        401,
        undefined,
        'Session expired. Please refresh the page and sign in again.',
      );
    }

    // 403 — two sub-cases: stale anti-forgery token (retry) vs real permission denial (throw)
    if (res.status === 403) {
      const code = await parseErrorCode(res);
      if (code === WebApiErrorCode.AntiForgeryTokenInvalid) {
        invalidateToken();
        attempt++;
        continue; // retry with a freshly-fetched token
      }
      throw new WebApiError(
        403,
        code,
        'Access denied. You do not have permission to perform this action.',
      );
    }

    // 429 / 5xx — transient failures; retry with exponential back-off
    if (res.status === 429 || res.status >= 500) {
      attempt++;
      if (attempt >= MAX_RETRIES) {
        throw new WebApiError(
          res.status,
          undefined,
          `Request failed with status ${res.status} after ${MAX_RETRIES} attempts.`,
        );
      }
      await sleep(BASE_DELAY_MS * Math.pow(2, attempt - 1));
      continue;
    }

    // Any other non-2xx response
    if (!res.ok) {
      const code = await parseErrorCode(res);
      throw new WebApiError(res.status, code, `Request failed with status ${res.status}.`);
    }

    return res;
  }

  // Reached only when every attempt was a retryable-but-non-throwing path
  // (e.g. repeated anti-forgery failures exhausting MAX_RETRIES)
  throw new WebApiError(0, undefined, 'Request failed: maximum retries exceeded.');
}
