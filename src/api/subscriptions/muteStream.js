/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions/properties', {
    subscription_data: JSON.stringify([
      {
        property: 'in_home_view',
        stream_id: streamId,
        value: false,
      },
    ]),
  });
