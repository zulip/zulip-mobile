/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiDelete } from '../apiFetch';

/** See https://zulip.com/api/unsubscribe */
export default (
  auth: Auth,
  subscriptions: $ReadOnlyArray<string>,
  principals?: $ReadOnlyArray<string>,
): Promise<ApiResponse> =>
  apiDelete(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
