/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../apiTypes';
import { apiPost } from '../apiFetch';

type ApiResponseRealmCreateFilters = {|
  ...ApiResponseSuccess,
  id: number,
|};

/** https://zulipchat.com/api/create-org-filters */
export default async (
  auth: Auth,
  pattern: string,
  urlFormatString: string,
): Promise<ApiResponseRealmCreateFilters> =>
  apiPost(auth, 'realm/filters', res => res, { pattern, url_format_string: urlFormatString });
