/**
 * Service layer for the `lpulga_webmessage` Dataverse table.
 *
 * The only operation exposed is `createWebMessage` — write-only, matching the
 * contact form's "submit message" use case.
 *
 * Power Pages returns HTTP 204 No Content on a successful POST, so the
 * function signature is Promise<void> with no response body to parse.
 *
 * The shared powerPagesFetch wrapper automatically handles:
 *   - Anti-forgery CSRF token (fetched once from /_layout/tokenhtml, cached,
 *     refreshed on 0x90040107 error code)
 *   - Exponential back-off retry on 429 / 5xx transient errors
 *   - 403 permission denials — thrown as WebApiError (use isPermissionError()
 *     to show a "contact your administrator" message in the UI)
 *   - 401 session expiry — thrown immediately with a "Session expired" message
 */

import { powerPagesFetch } from '../powerPagesApi';
import { WebMessageCreateInput } from '../../types/webMessage';

const ENTITY_SET = 'lpulga_webmessages';

/**
 * POSTs a new Web Message record to the Power Pages Web API.
 *
 * @param input - Sender name, email, and message body.
 * @returns     - Resolves with void on HTTP 204 success.
 * @throws      - WebApiError on 401, 403, 429, or 5xx after retries.
 *
 * @example
 *   await createWebMessage({
 *     lpulga_name:    'Jane Doe',
 *     lpulga_email:   'jane@example.com',
 *     lpulga_message: 'Hello, I have a question about ...',
 *   });
 */
export async function createWebMessage(input: WebMessageCreateInput): Promise<void> {
  // powerPagesFetch returns a 2xx Response; we discard the body because
  // Power Pages returns 204 No Content for successful POST operations.
  await powerPagesFetch(`/_api/${ENTITY_SET}`, {
    method: 'POST',
    body:   JSON.stringify(input),
  });
}
