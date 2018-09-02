/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

type SubscriptionObj = {|
  name: string,
|};

/** See https://zulipchat.com/api/add-subscriptions */
export default (
  auth: Auth,
  subscriptions: SubscriptionObj[],
  principals?: string[],
): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
