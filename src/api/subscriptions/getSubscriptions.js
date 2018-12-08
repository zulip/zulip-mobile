/* @flow strict-local */
import type { Auth, Subscription } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<Subscription[]> =>
  apiGet(auth, 'users/me/subscriptions', res => res.subscriptions);
