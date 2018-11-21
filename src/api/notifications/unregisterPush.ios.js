/* @flow */
import type { Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (auth: Account, token: string) =>
  apiDelete(auth, 'users/me/apns_device_token', res => res, { token });
