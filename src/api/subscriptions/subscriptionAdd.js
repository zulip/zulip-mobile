/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

type SubscriptionObj = {|
  name: string,
|};

/** See https://zulip.com/api/add-subscriptions */
export default (
  auth: Auth,
  subscriptions: SubscriptionObj[],
  principals?: string[],
): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
