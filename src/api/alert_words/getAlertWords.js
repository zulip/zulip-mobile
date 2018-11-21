/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Account): Promise<string[]> =>
  apiGet(auth, 'users/me/alert_words', res => res.alert_words);
