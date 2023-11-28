/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/test-notify */
export default async (
  auth: Auth,
  params: {|
    token: string,
  |},
): Promise<ApiResponse> =>
  apiPost(auth, 'mobile_push/test_notification', {
    token: params.token,
  });
