/* @flow */
import type { Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, token: string) =>
  apiDelete(auth, 'users/me/android_gcm_reg_id', res => res, { token });
