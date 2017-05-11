import { apiPost, Auth } from '../api/apiFetch';

export default async (auth: Auth, streamId) =>
  apiPost(
    auth,
    'users/me/subscriptions/properties',
    {
      subscription_data: JSON.stringify([
        {
          property: 'in_home_view',
          stream_id: streamId,
          value: false
        }
      ]
    )
    },
    res => res,
  );
