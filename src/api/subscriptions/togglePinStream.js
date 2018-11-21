/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account, streamId: number, value: boolean): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions/properties', res => res, {
    subscription_data: JSON.stringify([
      {
        property: 'pin_to_top',
        stream_id: streamId,
        value,
      },
    ]),
  });
