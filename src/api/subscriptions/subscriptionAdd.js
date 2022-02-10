/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

type SubscriptionObj = {|
  // TODO(server-future): This should use a stream ID (#3918), not stream name.
  //   Server issue: https://github.com/zulip/zulip/issues/10744
  // TODO(#3918): Change example in docs/style.md to something without this issue.
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
