/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseTempFileUrl = {|
  ...ApiResponseSuccess,
  url: string,
|};

/**
 * Get a temporary, authless partial URL to a realm-uploaded file.
 *
 * This endpoint was introduced in zulip/zulip@9e72fbe3f. The URL returned
 * allows a file to be viewed immediately without requiring a fresh login, but
 * it also does not include secrets like the API key. Currently, this URL
 * remains valid for 60 seconds. It can be used in various places in the app
 * where we open files in the browser, saving user's time.
 *
 * This endpoint is not documented, but the zulip.yaml[1] file describes it in
 * brief.
 *
 * [1] https://github.com/zulip/zulip/blob/master/zerver/openapi/zulip.yaml.
 *
 * @param auth Authentication info of the current user.
 * @param filePath The partial location of the uploaded file, as provided
 *    by the Zulip server to us in the message containing the file.
 *    It is a string of the form `/user_uploads/{realm_id_str}/{filename}`.
 */
export default (auth: Auth, filePath: string): Promise<ApiResponseTempFileUrl> =>
  apiGet(auth, filePath);
