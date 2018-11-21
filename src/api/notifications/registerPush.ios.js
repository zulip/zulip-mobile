/* @flow */
import type { Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (account: Account, token: string): Object =>
  apiPost(account, 'users/me/apns_device_token', res => res, {
    token,
    appid: 'org.zulip.Zulip',
  });
