/* @flow */
import type { Auth } from '../types';
import { apiPost } from './apiFetch';

export default (auth: Auth, email: string) =>
  apiPost(
    auth,
    'dev_fetch_api_key',
    res => res.api_key,
    { username: email },
  );
