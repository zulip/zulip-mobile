/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiPost } from '../apiFetch';

type ApiResponseRealmCreateFilters = {|
  ...ApiResponseSuccess,
  id: number,
|};

/** https://zulip.com/api/add-linkifier */
export default async (
  auth: Auth,
  pattern: string,
  urlFormatString: string,
): Promise<ApiResponseRealmCreateFilters> =>
  apiPost(auth, 'realm/filters', { pattern, url_format_string: urlFormatString });
