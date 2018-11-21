/* @flow */
import type { Account, ApiResponseSuccess, DevUser } from './apiTypes';
import { apiGet } from './apiFetch';

type ApiResponseDevListUsers = ApiResponseSuccess & {
  direct_admins: DevUser[],
  direct_users: DevUser[],
};

export default (account: Account): Promise<ApiResponseDevListUsers> => apiGet(account, 'dev_list_users');
