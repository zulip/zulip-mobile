/* @flow */
import type { Auth, Subscription } from '../../types';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<Subscription[]> =>
  apiGet(auth, 'users/me/subscriptions', res => res.subscriptions);
