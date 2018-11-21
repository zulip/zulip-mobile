/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (
  account: Account,
  subscriptions: string[],
  principals?: string[],
): Promise<ApiResponse> =>
  apiDelete(account, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
