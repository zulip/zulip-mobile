/**
 * @flow strict-local
 */
import invariant from 'invariant';
import { Platform, PermissionsAndroid } from 'react-native';

import { androidSdkVersion } from '../reactNativeUtils';

/**
 * Show dialog requesting POST_NOTIFICATIONS permission if appropriate.
 *
 * See Android doc:
 *   https://developer.android.com/develop/ui/views/notifications/notification-permission
 *
 * If androidSdkVersion() < 33 (Android 13), skips the permission request
 * and returns null. The permission only exists on Android 13 and above.
 *
 * Returns true if already granted or granted now,
 * or false if denied or if "don't ask again" applies.
 *
 * If the user has chosen "Deny" more than once during the app's lifetime of
 * installation, the dialog won't appear ("don't ask again" is assumed):
 *   https://developer.android.com/training/permissions/requesting#handle-denial
 */
export const androidRequestNotificationsPermission = async (): Promise<boolean | null> => {
  invariant(Platform.OS === 'android', 'androidRequestNotificationsPermission called on iOS');
  if (androidSdkVersion() < 33) {
    return null;
  }

  // See docs from Android for the underlying interaction with the user:
  //   https://developer.android.com/training/permissions/requesting
  // TODO(react-native-72): Use constant added in facebook/react-native@910a750fb:
  //   PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  const permission = 'android.permission.POST_NOTIFICATIONS';
  const granted = await PermissionsAndroid.check(permission);
  if (granted) {
    return true;
  }
  const result = await PermissionsAndroid.request(permission, {
    // RN uses this `rationale` argument to build a modal explaining why the
    // app needs the permission. Android and RN both have logic affecting
    // whether the modal is shown. For example, it may be shown if the
    // permission is being requested after previously being denied:
    //   https://developer.android.com/training/permissions/requesting#explain
    // The "OK" button dismisses the modal, after which Android's plain
    // Yes/No dialog will appear for the permission request.

    // TODO(i18n)
    title: 'Notifications',
    // TODO: Offer link to a help doc saying how to configure which
    //   messages you get notifications for.
    message: 'Zulip can send push notifications about messages you might be interested in.',
    buttonPositive: 'OK',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
};
