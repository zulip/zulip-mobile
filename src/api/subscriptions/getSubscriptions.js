/* @flow */
import type { Account, Subscription } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (account: Account): Promise<Subscription[]> =>
  apiGet(account, 'users/me/subscriptions', res => res.subscriptions);
