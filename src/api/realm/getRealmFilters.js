/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { RealmFilter } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseRealmFilters = {|
  ...ApiResponseSuccess,
  filters: RealmFilter[],
|};

export default async (auth: Auth): Promise<ApiResponseRealmFilters> =>
  apiGet(auth, 'realm/filters');
