/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default (auth: Auth, subscriptions: Object[]): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
  });
