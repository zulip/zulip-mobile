/* @flow strict-local */
import type { Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/**
 * Tell the server our device token for push notifications.
 *
 * @param mobileOS - Choose the server-side API intended for iOS or Android clients.
 */
export default async (auth: Auth, mobileOS: 'ios' | 'android', token: string): Promise<mixed> => {
  const routeName = mobileOS === 'android' ? 'android_gcm_reg_id' : 'apns_device_token';
  const extraParams = mobileOS === 'android' ? {} : { appid: 'org.zulip.Zulip' };
  return apiPost(auth, `users/me/${routeName}`, {
    token,
    ...extraParams,
  });
};
