/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

type SubscriptionObj = {|
  name: string,
|};

/** See https://zulip.com/api/subscribe */
export default (
  auth: Auth,
  subscriptions: $ReadOnlyArray<SubscriptionObj>,
  // TODO(server-3.0): Send numeric user IDs (#3764), not emails.
  principals?: $ReadOnlyArray<string>,
): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
