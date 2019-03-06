/* @flow strict-local */
import { DeviceEventEmitter, NativeModules, Platform, PushNotificationIOS } from 'react-native';
import NotificationsIOS from 'react-native-notifications';

import type { Auth, Dispatch, Narrow, User } from '../types';
import { topicNarrow, privateNarrow, groupNarrow } from '../utils/narrow';
import { forgetPushToken } from '../api';
import { logErrorRemotely } from '../utils/logging';
import {
  unackPushToken,
  gotPushToken,
  sendAllPushToken,
  narrowToNotification,
} from './notificationActions';
import { identityOfAuth } from '../account/accountMisc';

/**
 * The data we need in JS/React code for acting on a notification.
 *
 * The actual objects we describe with these types may have a bunch more
 * fields.  So, properly, these object types aren't really exact.  But
 * pretending they are seems to be the least unpleasant way to get Flow to
 * recognize the effect of refinements like `data.pm_users === undefined`.
 *
 * Currently:
 *
 *  * On iOS, these objects are translated directly, field by field, from
 *    the blobs of key/value pairs sent by the Zulip server in the
 *    "payload".  The set of fields therefore varies by server version.
 *
 *  * On Android, our platform-native code constructs the exact data to
 *    send; see `MessageFcmMessage#dataForOpen` in `FcmMessage.kt`.
 *    That should be kept in sync with this type definition, in which case
 *    these types really are exact.
 */
export type Notification =
  | {| recipient_type: 'stream', stream: string, topic: string |}
  // Group PM messages have `pm_users`, which is comma-separated IDs.
  | {| recipient_type: 'private', pm_users: string |}
  // 1:1 PM messages lack `pm_users`.
  | {| recipient_type: 'private', sender_email: string |};

export const getNarrowFromNotificationData = (
  data: ?Notification,
  usersById: Map<number, User>,
): Narrow | null => {
  if (!data || !data.recipient_type) {
    return null;
  }

  if (data.recipient_type === 'stream') {
    return topicNarrow(data.stream, data.topic);
  }

  if (data.pm_users === undefined) {
    return privateNarrow(data.sender_email);
  }

  const emails = [];
  const idStrs = data.pm_users.split(',');
  for (let i = 0; i < idStrs.length; ++i) {
    const user = usersById.get(+idStrs[i]);
    if (!user) {
      return null;
    }
    emails.push(user.email);
  }
  return groupNarrow(emails);
};

type NotificationMuddle =
  | Notification
  | null
  | void
  | { getData: () => Notification | { zulip: Notification } };

/** Extract the actual notification data from the wix library's wrapping (iOS only). */
// exported for tests
export const extractNotificationData = (notification: NotificationMuddle): Notification | null => {
  if (!notification || !notification.getData) {
    return null;
  }
  const data = notification.getData();
  return data && data.zulip ? data.zulip : data;
};

const getInitialNotification = async (): Promise<Notification | null> => {
  if (Platform.OS === 'android') {
    const { Notifications } = NativeModules;
    return Notifications.getInitialNotification();
  }
  const notification = await PushNotificationIOS.getInitialNotification();
  // $FlowFixMe Upstream's libdef for getInitialNotification has `Object` types.
  return extractNotificationData(notification);
};

export const handleInitialNotification = async (dispatch: Dispatch) => {
  const data = await getInitialNotification();
  dispatch(narrowToNotification(data));
};

/**
 * Listens for notification-related events.
 *
 * An instance of this doesn't affect the subscriptions of any other
 * instance, or anything else.
 */
export class NotificationListener {
  dispatch: Dispatch;
  unsubs: Array<() => void> = [];

  constructor(dispatch: Dispatch) {
    this.dispatch = dispatch;
  }

  /** Private. */
  listen(name: string, handler: (...empty) => void | Promise<void>) {
    if (Platform.OS === 'ios') {
      NotificationsIOS.addEventListener(name, handler);
      this.unsubs.push(() => NotificationsIOS.removeEventListener(name, handler));
    }
    const subscription = DeviceEventEmitter.addListener(name, handler);
    this.unsubs.push(() => subscription.remove());
  }

  /** Private. */
  unlistenAll() {
    while (this.unsubs.length > 0) {
      this.unsubs.pop()();
    }
  }

  /** Private. */
  handleNotificationOpen = (notification: NotificationMuddle) => {
    const data: Notification =
      // $FlowFixMe clarify notification types
      Platform.OS === 'ios' ? extractNotificationData(notification) : notification;
    this.dispatch(narrowToNotification(data));
  };

  /** Private. */
  handleDeviceToken = async (deviceToken: string) => {
    this.dispatch(gotPushToken(deviceToken));
    await this.dispatch(sendAllPushToken());
  };

  /** Start listening.  Don't call twice without intervening `stop`. */
  start() {
    this.listen('notificationOpened', this.handleNotificationOpen);
    this.listen('remoteNotificationsRegistered', this.handleDeviceToken);
    if (Platform.OS === 'ios') {
      this.listen('remoteNotificationsRegistrationFailed', (error: string) => {
        logErrorRemotely(new Error(error), 'Failed to register iOS push token');
      });
    }
  }

  /** Stop listening. */
  stop() {
    this.unlistenAll();
  }
}

/** Try to cause a `remoteNotificationsRegistered` event. */
export const getNotificationToken = () => {
  if (Platform.OS === 'ios') {
    // This leads to a call (in wix's, or RN upstream's, NotificationsIOS) to this:
    //   https://developer.apple.com/documentation/uikit/uiapplication/1622932-registerusernotificationsettings
    // (deprecated after iOS 10, yikes!); which after possibly prompting the
    // user causes "the app" (i.e. the platform part) to call this, I think,
    // though I haven't successfully traced all the steps there:
    //   https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623022-application?language=objc
    // which certainly in the wix case leads to a call to this:
    //   https://developer.apple.com/documentation/uikit/uiapplication/1623078-registerforremotenotifications
    // which "initiate[s] the registration process with [APNs]".  Then the
    // methods that calls on success/failure in turn are implemented to send
    // an event with name `remoteNotificationsRegistered` etc., in both the
    // wix and RN-upstream case.  (Though NB in the *failure* case, the
    // event names differ!  wix has s/Error/Failed/ vs. upstream; also
    // upstream has singular for failure although plural for success, ouch.)
    //
    // In short, this kicks off a sequence: permissions -> "register" ->
    // send event we already have a global listener for.  And the first two
    // steps satisfy the stern warnings in Apple's docs (at the above links)
    // to request permissions first, then "register".
    NotificationsIOS.requestPermissions();
  } else {
    // On Android, we do this at application startup.
  }
};

export const tryStopNotifications = async (
  auth: Auth,
  token: string | null,
  dispatch: Dispatch,
) => {
  if (token !== null) {
    dispatch(unackPushToken(identityOfAuth(auth)));
    try {
      await forgetPushToken(auth, Platform.OS, token);
    } catch (e) {
      logErrorRemotely(e, 'failed to unregister Push token');
    }
  }
};
