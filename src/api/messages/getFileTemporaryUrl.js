/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseTempFileUrl = {|
  ...$Exact<ApiResponseSuccess>,
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
 * This endpoint is not in the Zulip API docs on the web, but it is
 * documented in our OpenAPI description:
 *   https://github.com/zulip/zulip/blob/main/zerver/openapi/zulip.yaml
 * under the name `get_file_temporary_url`.
 *
 * @param auth Authentication info of the current user.
 * @param filePath The location of the uploaded file, as a
 *    "path-absolute-URL string"
 *    (https://url.spec.whatwg.org/#path-absolute-url-string) meant for the
 *    realm, of the form `/user_uploads/{realm_id_str}/{filename}`.
 */
export default async (auth: Auth, filePath: string): Promise<URL> => {
  const response: ApiResponseTempFileUrl = await apiGet(
    auth,

    // Remove leading slash so apiGet doesn't duplicate it.
    filePath.substring(1),
  );

  return new URL(response.url, auth.realm);
};
