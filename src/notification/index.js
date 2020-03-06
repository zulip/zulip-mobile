/* @flow strict-local */
import { DeviceEventEmitter, NativeModules, Platform, PushNotificationIOS } from 'react-native';
import NotificationsIOS from 'react-native-notifications';

import type { Auth, Dispatch, Identity, Narrow, User } from '../types';
import { topicNarrow, privateNarrow, groupNarrow } from '../utils/narrow';
import type { JSONable } from '../utils/jsonable';
import * as api from '../api';
import * as logging from '../utils/logging';
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
  | {| recipient_type: 'stream', stream: string, topic: string, realm_uri?: string |}
  // Group PM messages have `pm_users`, which is comma-separated IDs.
  | {| recipient_type: 'private', pm_users: string, realm_uri?: string |}
  // 1:1 PM messages lack `pm_users`.
  | {| recipient_type: 'private', sender_email: string, realm_uri?: string |};

/**
 * Identify the account the notification is for, if possible.
 *
 * Returns an index into `identities`, or `null` if we can't tell.
 *
 * @param identities Identities corresponding to the accounts state in Redux.
 */
export const getAccountFromNotificationData = (
  data: Notification,
  identities: $ReadOnlyArray<Identity>,
): number | null => {
  const { realm_uri } = data;
  if (realm_uri == null) {
    // Old server, no realm info included.  If needed to cater to 1.8.x
    // servers, could try to guess using serverHost; for now, don't.
    logging.warn('notification missing field: realm_uri');
    return null;
  }

  const urlMatches = [];
  identities.forEach((account, i) => {
    if (account.realm === realm_uri) {
      urlMatches.push(i);
    }
  });

  if (urlMatches.length === 0) {
    // No match.  Either we logged out of this account and didn't
    // successfully tell the server to stop sending notifications (possibly
    // just a race -- this notification was sent before the logout); or
    // there's some confusion where the realm_uri we have is different from
    // the one the server sends in notifications.
    const knownUrls = identities.map(({ realm }) => realm);
    logging.warn('notification realm_uri not found in accounts', {
      realm_uri,
      known_urls: knownUrls,
    });
    return null;
  }

  if (urlMatches.length > 1) {
    // The user has several accounts in the notification's realm.  We should
    // be able to tell the right one using the notification's `user_id`...
    // except we don't store user IDs in `accounts`, only emails.  Until we
    // fix that, just ignore the information.
    logging.warn('notification realm_uri ambiguous; multiple matches found', {
      realm_uri,
      match_count: urlMatches.length,
    });
    // TODO get user_id into accounts data, and use that
    return null;
  }

  return urlMatches[0];
};

export const getNarrowFromNotificationData = (
  data: Notification,
  usersById: Map<number, User>,
): Narrow | null => {
  if (!data.recipient_type) {
    // This condition is impossible if the value is rightly-typed; but in
    // the iOS case it comes more or less unfiltered from the Zulip server,
    // so we check here.
    //
    // TODO check further upstream instead, at a "crunchy shell".
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
 * From rn-notifications@1.5.0's RNNotifications.m.
 */
type NotificationRegistrationFailedEvent = {|
  domain: string, // e.g. 'NSCocoaErrorDomain'
  code: number,
  localizedDescription: string,
|};

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
    } else {
      const subscription = DeviceEventEmitter.addListener(name, handler);
      this.unsubs.push(() => subscription.remove());
    }
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
  handleDeviceToken = async (deviceToken: mixed) => {
    // A device token should be some (platform-dependent and largely
    // unspecified) flavor of string.
    if (typeof deviceToken !== 'string') {
      // $FlowFixMe: deviceToken probably _is_ JSONable, but we can only hope
      const token: JSONable = deviceToken;
      logging.error('Received invalid device token', { token });
      return;
    }

    this.dispatch(gotPushToken(deviceToken));
    await this.dispatch(sendAllPushToken());
  };

  /** Private. */
  handleRegistrationFailure = (err: NotificationRegistrationFailedEvent) => {
    logging.warn(`Failed to register iOS push token: ${err.domain}:#${err.code}`, {
      raw_error: err,
    });
  };

  /** Start listening.  Don't call twice without intervening `stop`. */
  start() {
    this.listen('notificationOpened', this.handleNotificationOpen);
    this.listen('remoteNotificationsRegistered', this.handleDeviceToken);
    if (Platform.OS === 'ios') {
      this.listen('remoteNotificationsRegistrationFailed', this.handleRegistrationFailure);
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
      await api.forgetPushToken(auth, Platform.OS, token);
    } catch (e) {
      logging.warn(e);
    }
  }
};
