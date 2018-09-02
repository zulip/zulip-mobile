/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiDelete } from '../apiFetch';

/** See https://zulipchat.com/api/remove-subscriptions */
export default (auth: Auth, subscriptions: string[], principals?: string[]): Promise<ApiResponse> =>
  apiDelete(auth, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
  });
