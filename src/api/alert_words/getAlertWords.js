/* @flow */
import type { Auth } from '../../types';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<string[]> =>
  apiGet(auth, 'users/me/alert_words', res => res.alert_words);
