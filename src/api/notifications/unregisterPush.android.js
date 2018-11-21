/* @flow */
import type { Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (account: Account, token: string) =>
  apiDelete(account, 'users/me/android_gcm_reg_id', res => res, { token });
