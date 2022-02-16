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
  const extraParams =
    // The `Object.freeze` is to work around a Flow issue:
    //   https://github.com/facebook/flow/issues/2386#issuecomment-695064325
    mobileOS === 'android' ? Object.freeze({}) : { appid: 'org.zulip.Zulip' };
  return apiPost(auth, `users/me/${routeName}`, {
    token,
    ...extraParams,
  });
};
