import { apiPost, Auth } from './apiFetch';

export default (
  auth: Auth,
  subscriptions: [],
) =>
  apiPost(
    auth,
    'users/me/subscriptions',
    { subscriptions: JSON.stringify(subscriptions) },
    res => res,
  );
