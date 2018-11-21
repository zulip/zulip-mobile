/* @flow */
import type { Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account, token: string): Object =>
  apiPost(auth, 'users/me/apns_device_token', res => res, {
    token,
    appid: 'org.zulip.Zulip',
  });
