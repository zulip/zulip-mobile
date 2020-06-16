/* @flow strict-local */
import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import type { PushNotificationEventName } from '@react-native-community/push-notification-ios';

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

/**
 * Read the notification the app was started from, if any.
 *
 * This consumes the data; if called a second time, the result is always
 * null.
 *
 * (TODO: Well, it does on Android, anyway.  #4763 is for doing so on iOS.)
 */
const readInitialNotification = async (): Promise<Notification | null> => {
  if (Platform.OS === 'android') {
    const { Notifications } = NativeModules;
    return Notifications.readInitialNotification();
  }

  const notification: ?PushNotificationIOS = await PushNotificationIOS.getInitialNotification();
  if (!notification) {
    return null;
  }

  // This is actually typed as ?Object (and so effectively `any`); but if
  // present, it must be a JSONable dictionary. It's giving us the
  // notification data, which was passed over APNs as JSON.
  const data: ?JSONableDict = notification.getData();
  if (!data) {
    return null;
  }
  return fromAPNs(data) || null;
};

/**
 * Act on the notification-opening the app was started from, if any.
 *
 * That is, if the app was started by the user opening a notification, act
 * on that; in particular, navigate to the conversation the notification was
 * from.
 *
 * This consumes the relevant data; if called multiple times after the user
 * only once opened a notification, it'll only do anything once.
 */
export const handleInitialNotification = async (dispatch: Dispatch) => {
  const data = await readInitialNotification();
  dispatch(narrowToNotification(data));
};

/**
 * From ios/RNCPushNotificationIOS.m in @rnc/push-notification-ios at 1.2.2.
 */
type NotificationRegistrationFailedEvent = {|
  // NSError.localizedDescription, see
  // https://developer.apple.com/documentation/foundation/nserror/1414418-localizeddescription
  message: string,

  // NSError.code, see
  // https://developer.apple.com/documentation/foundation/nserror/1409165-code
  code: number,

  // NSError.userInfo, see
  // https://developer.apple.com/documentation/foundation/nserror/1411580-userinfo
  details: JSONableDict,
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
  listenIOS(name: PushNotificationEventName, handler: (...empty) => void | Promise<void>) {
    // In the native code, the PushNotificationEventName we pass here
    // is mapped to something else (see implementation):
    //
    // 'notification'      -> 'remoteNotificationReceived'
    // 'localNotification' -> 'localNotificationReceived'
    // 'register'          -> 'remoteNotificationsRegistered'
    // 'registrationError' -> 'remoteNotificationRegistrationError'
    PushNotificationIOS.addEventListener(name, handler);
    this.unsubs.push(() => PushNotificationIOS.removeEventListener(name));
  }

  /** Private. */
  listenAndroid(name: string, handler: (...empty) => void | Promise<void>) {
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
  handleIOSRegistrationFailure = (err: NotificationRegistrationFailedEvent) => {
    logging.warn(`Failed to register iOS push token: ${err.code}`, {
      raw_error: err,
    });
  };

  /** Start listening.  Don't call twice without intervening `stop`. */
  async start() {
    if (Platform.OS === 'android') {
      // On Android, the object passed to the handler is constructed in
      // FcmMessage.kt, and will always be a Notification.
      this.listenAndroid('notificationOpened', this.handleNotificationOpen);
      this.listenAndroid('remoteNotificationsRegistered', this.handleDeviceToken);
    } else {
      this.listenIOS('notification', (notification: PushNotificationIOS) => {
        // This is actually typed as ?Object (and so effectively `any`); but
        // if present, it must be a JSONable dictionary. It's giving us the
        // notification data, which was passed over APNs as JSON.
        const data: ?JSONableDict = notification.getData();
        if (!data) {
          return;
        }
        const dataFromAPNs: Notification | void = fromAPNs(data);
        if (!dataFromAPNs) {
          return;
        }
        this.handleNotificationOpen(dataFromAPNs);
      });
      this.listenIOS('register', this.handleDeviceToken);
      this.listenIOS('registrationError', this.handleIOSRegistrationFailure);
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

/**
 * Try to cause a `remoteNotificationsRegistered` event.
 *
 * Our 'register' listener will fire on that event.
 */
export const getNotificationToken = () => {
  if (Platform.OS === 'ios') {
    // This leads to a call in RNCPushNotificationIOS to this, to
    // maybe prompt the user to grant authorization, with options for
    // what things to authorize (badge, sound, alert, etc.):
    //   https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/1649527-requestauthorizationwithoptions
    //
    // If authorization is granted, the library calls this, to have the
    // application register for remote notifications:
    //   https://developer.apple.com/documentation/appkit/nsapplication/2967172-registerforremotenotifications?language=occ
    //
    // (Then, in case we're interested, the library calls
    //   https://developer.apple.com/documentation/usernotifications/unusernotificationcenter/1649524-getnotificationsettingswithcompl
    // and sets the eventual result to be the resolution of the
    // Promise we get, so we can know if the user has enabled
    // alerts, the badge count, and sound.)
    //
    // The above-mentioned `registerForRemoteNotifications` function
    // ends up sending the app a device token; the app receives it in
    // our own code: `AppDelegate`'s
    // `didRegisterForRemoteNotificationsWithDeviceToken` method:
    //   https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622958-application?language=objc.
    // Following the library's setup instructions, we've asked that
    // method to hand control back to the library.
    //
    // It looks like the library then creates a notification, with the
    // magic-string name "RemoteNotificationsRegistered", using
    //   https://developer.apple.com/documentation/foundation/nsnotificationcenter/1415812-postnotificationname?language=objc.
    // It listens for this notification with
    //   https://developer.apple.com/documentation/foundation/nsnotificationcenter/1415360-addobserver
    // and, upon receipt, sends a React Native event to the JavaScript
    // part of the library. We can listen to this event, with
    // `PushNotificationIOS.addEventListener`, under the alias
    // 'register'. (We can also listen for registration failure under
    // the alias 'registrationError'.)
    //
    // In short, this kicks off a sequence:
    //   authorization, with options ->
    //   register for remote notifications ->
    //   send event we already have a global listener for
    //
    // This satisfies the stern warnings in Apple's docs (at the above
    // links) to request authorization before registering with the push
    // notification service.
    PushNotificationIOS.requestPermissions();
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
