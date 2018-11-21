/* @flow */
import type { Account, Subscription } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Account): Promise<Subscription[]> =>
  apiGet(auth, 'users/me/subscriptions', res => res.subscriptions);
