/* @flow */
import type { Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, token: string): Object =>
  apiPost(auth, 'users/me/apns_device_token', res => res, {
    token,
    appid: 'org.zulip.Zulip',
  });
