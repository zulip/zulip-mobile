/* @flow */
import type { Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (account: Account, token: string) =>
  apiDelete(account, 'users/me/apns_device_token', res => res, { token });
