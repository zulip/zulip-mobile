/* @flow */
import type { Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, token: string) =>
  apiPost(auth, 'users/me/android_gcm_reg_id', res => res, {
    token,
  });
