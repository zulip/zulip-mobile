/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiDelete } from '../apiFetch';

/** See https://zulip.com/api/remove-subscriptions */
export default (auth: Auth, subscriptions: string[], principals?: string[]): Promise<ApiResponse> =>
  apiDelete(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
