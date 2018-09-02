/* @flow strict-local */
import type { Auth, Subscription } from '../apiTypes';
import { apiGet } from '../apiFetch';

/** See https://zulipchat.com/api/get-subscribed-streams */
export default async (auth: Auth): Promise<Subscription[]> =>
  apiGet(auth, 'users/me/subscriptions', res => res.subscriptions);
