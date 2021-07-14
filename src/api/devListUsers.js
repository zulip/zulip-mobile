/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from './transportTypes';
import type { DevUser } from './apiTypes';
import { apiGet } from './apiFetch';

type ApiResponseDevListUsers = {|
  ...$Exact<ApiResponseSuccess>,
  direct_admins: DevUser[],
  direct_users: DevUser[],
|};

export default (auth: Auth): Promise<ApiResponseDevListUsers> => apiGet(auth, 'dev_list_users');
