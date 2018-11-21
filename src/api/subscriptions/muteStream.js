/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account, streamId: number): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions/properties', res => res, {
    subscription_data: JSON.stringify([
      {
        property: 'in_home_view',
        stream_id: streamId,
        value: false,
      },
    ]),
  });
