/* @flow */
import type { Auth } from '../types';
import { apiDelete } from './apiFetch';

export default (auth: Auth, alertWord: string) =>
  apiDelete(auth, 'users/me/alert_words', res => res, {
    alert_words: JSON.stringify([alertWord]),
  });
