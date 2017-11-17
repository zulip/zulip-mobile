/* @flow */
import type { Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, token: string) =>
  apiDelete(auth, 'users/me/apns_device_token', res => res.api_key, { token });
