/* @flow strict-local */
import { DeviceEventEmitter, NativeModules, Platform, PushNotificationIOS } from 'react-native';
import NotificationsIOS from 'react-native-notifications';

import type { Notification } from './types';
import type { Auth, Dispatch, Identity, Narrow, UserId, UserOrBot } from '../types';
import { topicNarrow, pm1to1NarrowFromUser, pmNarrowFromRecipients } from '../utils/narrow';
import type { JSONable, JSONableDict } from '../utils/jsonable';
import * as api from '../api';
import * as logging from '../utils/logging';
import {
  unackPushToken,
  gotPushToken,
  sendAllPushToken,
  narrowToNotification,
} from './notificationActions';
import { identityOfAuth } from '../account/accountMisc';
import { fromAPNs } from './extract';
import { tryParseUrl } from '../utils/url';
import { pmKeyRecipientsFromIds } from '../utils/recipient';
import { makeUserId } from '../api/idTypes';

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

  const realmUrl = tryParseUrl(realm_uri);
  if (realmUrl === undefined) {
    logging.warn('notification realm_uri invalid as URL', { realm_uri });
    return null;
  }

  const urlMatches = [];
  identities.forEach((account, i) => {
    if (account.realm.href === realmUrl.href) {
      urlMatches.push(i);
    }
  });

  if (urlMatches.length === 0) {
    // No match.  Either we logged out of this account and didn't
    // successfully tell the server to stop sending notifications (possibly
    // just a race -- this notification was sent before the logout); or
    // there's some confusion where the realm_uri we have is different from
    // the one the server sends in notifications.
    const knownUrls = identities.map(({ realm }) => realm.href);
    logging.warn('notification realm_uri not found in accounts', {
      realm_uri,
      parsed_url: realmUrl,
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
      parsed_url: realmUrl,
      match_count: urlMatches.length,
    });
    // TODO get user_id into accounts data, and use that
    return null;
  }

  return urlMatches[0];
};

export const getNarrowFromNotificationData = (
  data: Notification,
  allUsersByEmail: Map<string, UserOrBot>,
  ownUserId: UserId,
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
    const user = allUsersByEmail.get(data.sender_email);
    return (user && pm1to1NarrowFromUser(user)) ?? null;
  }

  const ids = data.pm_users.split(',').map(s => makeUserId(parseInt(s, 10)));
  return pmNarrowFromRecipients(pmKeyRecipientsFromIds(ids, ownUserId));
};

const getInitialNotification = async (): Promise<Notification | null> => {
  if (Platform.OS === 'android') {
    const { Notifications } = NativeModules;
    return Notifications.getInitialNotification();
  }

  const notification: ?PushNotificationIOS = await PushNotificationIOS.getInitialNotification();
  if (!notification) {
    return null;
  }

  // This is actually typed as ?Object (and so effectively `any`); but if
  // present, it must be a JSONable dictionary. (See PushNotificationIOS.js and
  // RCTPushNotificationManager.m in Libraries/PushNotificationIOS.)
  const data: ?JSONableDict = notification.getData();
  if (!data) {
    return null;
  }
  return fromAPNs(data) || null;
};

export const handleInitialNotification = async (dispatch: Dispatch) => {
  const data = await getInitialNotification();
  dispatch(narrowToNotification(data));
};

export const notificationOnAppActive = () => {
  if (Platform.OS === 'ios') {
    try {
      // Allow 'notificationOpened' events to be emitted when pressing
      // a notification when the app is in the background.
      //
      // TODO: This API is deprecated in react-native-notifications release
      // 2.0.6-snapshot.8; see #3647.
      //
      // We don't know the behavior if this is called before
      // NotificationsIOS.requestPermissions(), so, catch any errors
      // silently. Ray's investigation shows that it *shouldn't*
      // throw, but may (https://github.com/zulip/zulip-mobile/pull/3947#discussion_r389192513).
      NotificationsIOS.consumeBackgroundQueue();
    } catch (e) {
      logging.warn(e, {
        message:
          'Call to NotificationsIOS.consumeBackgroundQueue failed; pressed notification failed to navigate',
      });
    }
  }
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
  handleNotificationOpen = (notification: Notification) => {
    this.dispatch(narrowToNotification(notification));
  };

  /**
   * Private.
   *
   * @param deviceToken This should be a `?string`, but there's no typechecking
   *   at the registration site to allow us to ensure it. As we've been burned
   *   by unexpected types here before, we do the validation explicitly.
   */
  handleDeviceToken = async (deviceToken: mixed) => {
    // Null device tokens are known to occur (at least) on Android emulators
    // without Google Play services, and have been reported in other scenarios.
    // See https://stackoverflow.com/q/37517860 for relevant discussion.
    //
    // Otherwise, a device token should be some (platform-dependent and largely
    // unspecified) flavor of string.
    if (deviceToken !== null && typeof deviceToken !== 'string') {
      /* $FlowFixMe[incompatible-type]: `deviceToken` probably _is_
         JSONable, but we can only hope. */
      const token: JSONable = deviceToken;
      logging.error('Received invalid device token', { token });
      // Take no further action.
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
  async start() {
    if (Platform.OS === 'android') {
      // On Android, the object passed to the handler is constructed in
      // FcmMessage.kt, and will always be a Notification.
      this.listen('notificationOpened', this.handleNotificationOpen);
    } else {
      // On iOS, `note` should be an IOSNotifications object. The notification
      // data it returns from `getData` is unvalidated -- it comes almost
      // straight off the wire from the server.
      this.listen('notificationOpened', (note: { getData(): JSONableDict }) => {
        const data = fromAPNs(note.getData());
        if (data) {
          this.handleNotificationOpen(data);
        }
      });
    }

    this.listen('remoteNotificationsRegistered', this.handleDeviceToken);
    if (Platform.OS === 'ios') {
      this.listen('remoteNotificationsRegistrationFailed', this.handleRegistrationFailure);
    }

    if (Platform.OS === 'android') {
      // A bug was introduced in 3730be4c8 that delayed the setup of
      // our listener for 'remoteNotificationsRegistered' until a time
      // after the event was emitted from the native code. Until we
      // settle on a better, more consistent architecture, just grab
      // the token here and do the same thing our handler does (by
      // just calling the handler).
      this.handleDeviceToken(await NativeModules.Notifications.getToken());
    } else {
      // On iOS, we come back to this later: after the initial fetch, we
      // end up calling `getNotificationToken`, below, and that will cause
      // us to get the token if the user gives us notification permission.
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
