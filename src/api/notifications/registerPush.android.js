/* @flow */
import type { Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account, token: string) =>
  apiPost(auth, 'users/me/android_gcm_reg_id', res => res, {
    token,
  });
