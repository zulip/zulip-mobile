import { apiPost, Auth } from './apiFetch';

export default (
  auth: Auth,
  subscriptions: string[],
) =>
  apiPost(
    auth,
    'users/me/subscriptions',
    { subscriptions },
    res => res,
  );
