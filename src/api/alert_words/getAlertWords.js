/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (account: Account): Promise<string[]> =>
  apiGet(account, 'users/me/alert_words', res => res.alert_words);
