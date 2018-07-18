/* @flow */
import type { Auth } from './apiTypes';
import { apiPost } from './apiFetch';

export default (auth: Auth, email: string, password: string) =>
  apiPost(auth, 'fetch_api_key', res => res, { username: email, password });
