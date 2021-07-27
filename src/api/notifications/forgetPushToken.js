/* @flow strict-local */
import type { Auth } from '../transportTypes';
import { apiDelete } from '../apiFetch';

/**
 * Tell the server to forget this device token for push notifications.
 *
 * @param mobileOS - Choose the server-side API intended for iOS or Android clients.
 */
export default (auth: Auth, mobileOS: 'ios' | 'android', token: string): Promise<mixed> => {
  const routeName = mobileOS === 'android' ? 'android_gcm_reg_id' : 'apns_device_token';
  return apiDelete(auth, `users/me/${routeName}`, { token });
};
