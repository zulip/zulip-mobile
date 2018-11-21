/* @flow */
import type { Account } from './apiTypes';
import { apiPost } from './apiFetch';

export default (account: Account, email: string) =>
  apiPost(account, 'dev_fetch_api_key', res => res.api_key, { username: email });
