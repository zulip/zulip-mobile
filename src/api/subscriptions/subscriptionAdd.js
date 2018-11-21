/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

type SubscriptionObj = {
  name: string,
};

export default (
  account: Account,
  subscriptions: SubscriptionObj[],
  principals?: string[],
): Promise<ApiResponse> =>
  apiPost(account, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
