/* @flow */
import type { Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (account: Account, token: string) =>
  apiPost(account, 'users/me/android_gcm_reg_id', res => res, {
    token,
  });
