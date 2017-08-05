/* @flow */
import type { AlertWords, Auth } from '../types';
import { apiPut } from './apiFetch';

export default (auth: Auth, alertWord: string): AlertWords =>
  apiPut(auth, 'users/me/alert_words', res => res, {
    alert_words: JSON.stringify(alertWord),
  });
