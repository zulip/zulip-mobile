/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export type SubscriptionProperty = 'is_muted' | 'pin_to_top' | 'push_notifications';

/** See https://chat.zulip.org/api/update-subscription-settings */
export default async (
  auth: Auth,
  streamId: number,
  property: SubscriptionProperty,
  value: boolean,
): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions/properties', {
    subscription_data: JSON.stringify([
      {
        stream_id: streamId,

        // Let callers use the modern property, 'is_muted', but give
        // the server the older, confusingly named property
        // 'in_home_view' with the opposite value.
        //
        // TODO: 'is_muted' is said to be new in Zulip 2.1, released
        // 2019-12-12. Switch to sending that, once we can.
        ...(property === 'is_muted'
          ? { property: 'in_home_view', value: !value }
          : { property, value }),
      },
    ]),
  });
