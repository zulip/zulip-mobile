/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number, value: boolean): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions/properties', {
    subscription_data: JSON.stringify([
      {
        property: 'push_notifications',
        stream_id: streamId,
        value,
      },
    ]),
  });
