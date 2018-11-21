/* @flow */
import type { Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (auth: Account, token: string) =>
  apiDelete(auth, 'users/me/android_gcm_reg_id', res => res, { token });
