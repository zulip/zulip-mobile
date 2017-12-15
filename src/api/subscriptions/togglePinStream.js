/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number, value: boolean) =>
  apiPost(auth, 'users/me/subscriptions/properties', res => res, {
    subscription_data: JSON.stringify([
      {
        property: 'pin_to_top',
        stream_id: streamId,
        value,
      },
    ]),
  });
