/* @flow */
import type { Auth } from '../types';
import { apiPost } from './apiFetch';

export default async (auth: Auth, token: string) => {
  apiPost(
    auth,
    'users/me/apns_device_token',
    res => res,
    {
      token,
      appid: 'com.zulip.Zulip'
    },
  );
};
