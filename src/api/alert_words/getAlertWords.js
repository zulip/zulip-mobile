/* @flow */
import type { Auth } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<string[]> =>
  apiGet(auth, 'users/me/alert_words', res => res.alert_words);
