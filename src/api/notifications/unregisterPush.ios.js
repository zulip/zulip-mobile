/* @flow strict-local */
import type { Auth } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, token: string) =>
  apiDelete(auth, 'users/me/apns_device_token', res => res, { token });
