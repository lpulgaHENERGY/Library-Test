/**
 * Service layer for the `lpulga_libraryitem` Dataverse table.
 *
 * All reads go through the shared powerPagesFetch wrapper which handles
 * CSRF token management, automatic retries, and typed error reporting.
 *
 * Pagination strategy:
 *   - Page size is controlled via `Prefer: odata.maxpagesize=N` (not $top).
 *   - Total count is fetched with $count=true on every request.
 *   - Subsequent pages are fetched by passing the `nextLink` cursor returned
 *     from the previous call — never use $skip (unsupported by Power Pages).
 */

import { powerPagesFetch, buildODataUrl, parseListResponse } from '../powerPagesApi';
import { LibraryItemEntity, LibraryItem, mapLibraryItem } from '../../types/libraryItem';

const ENTITY_SET = 'lpulga_libraryitems';

/** Columns fetched on every request — explicit $select, no wildcards. */
const SELECT_COLUMNS: string[] = [
  'lpulga_libraryitemid',
  'lpulga_name',
  'lpulga_author',
  'lpulga_excerpt',
  'lpulga_imgid',
  'lpulga_externalid',
];

// ---------------------------------------------------------------------------
// Return types
// ---------------------------------------------------------------------------

export interface LibraryItemsPage {
  /** Mapped domain items for this page. */
  items: LibraryItem[];
  /**
   * Total record count across all pages (from @odata.count).
   * Falls back to items.length when the server omits the count header.
   */
  totalCount: number;
  /**
   * Opaque cursor URL for the next page, or null when on the last page.
   * Pass directly as `nextLink` on the next getLibraryItems() call.
   */
  nextLink: string | null;
}

// ---------------------------------------------------------------------------
// getLibraryItems
// ---------------------------------------------------------------------------

export interface GetLibraryItemsOptions {
  /**
   * Number of records per page.
   * Controlled via Prefer: odata.maxpagesize, not $top.
   * Default: 50.
   */
  pageSize?: number;
  /**
   * Cursor URL from a previous page's `nextLink`.
   * When provided, the URL is used as-is instead of building a new one.
   * Default: null (fetches the first page).
   */
  nextLink?: string | null;
}

/**
 * Fetches a page of Library Items from the Power Pages Web API.
 *
 * First page:
 *   const page = await getLibraryItems();
 *
 * Subsequent pages (cursor-based — Power Pages does not support $skip):
 *   if (page.nextLink) {
 *     const next = await getLibraryItems({ nextLink: page.nextLink });
 *   }
 */
export async function getLibraryItems(
  options: GetLibraryItemsOptions = {},
): Promise<LibraryItemsPage> {
  const { pageSize = 50, nextLink = null } = options;

  // Use the nextLink cursor verbatim for subsequent pages;
  // build the first-page URL from structured options.
  const url =
    nextLink ??
    buildODataUrl(ENTITY_SET, {
      select:  SELECT_COLUMNS,
      orderby: 'lpulga_name asc',
      count:   true,
    });

  const res = await powerPagesFetch(url, {
    method: 'GET',
    headers: {
      // odata.maxpagesize controls page size without capping total results.
      // odata.include-annotations provides formatted display values for
      // option sets and lookups (not needed here but costs nothing to include).
      Prefer: [
        `odata.maxpagesize=${pageSize}`,
        'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
      ].join(','),
    },
    // GET requests do not require the anti-forgery token.
    skipToken: true,
  });

  const data = await parseListResponse<LibraryItemEntity>(res);

  return {
    items:      data.value.map(mapLibraryItem),
    totalCount: data['@odata.count'] ?? data.value.length,
    nextLink:   data['@odata.nextLink'] ?? null,
  };
}
