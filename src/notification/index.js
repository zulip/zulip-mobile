/* @flow strict-local */
import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import type { PushNotificationEventName } from '@react-native-community/push-notification-ios';

import type { Notification } from './types';
import type {
  Auth,
  Dispatch,
  GlobalDispatch,
  Account,
  Narrow,
  Stream,
  UserId,
  UserOrBot,
} from '../types';
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
import { fromPushNotificationIOS } from './extract';
import { tryParseUrl } from '../utils/url';
import { pmKeyRecipientsFromIds } from '../utils/recipient';
import { makeUserId } from '../api/idTypes';
import { getAccounts } from '../directSelectors';

/**
 * Identify the account the notification is for, if possible.
 *
 * Returns an index into `accounts`, or `null` if we can't tell.
 * In the latter case, logs a warning.
 *
 * @param accounts The accounts state in Redux.
 */
export const getAccountFromNotificationData = (
  data: Notification,
  accounts: $ReadOnlyArray<Account>,
): number | null => {
  const { realm_uri, user_id } = data;
  if (realm_uri == null) {
    // Old server, no realm info included.  This field appeared in
    // Zulip 1.8, so we don't support these servers anyway.
    logging.warn('notification missing field: realm_uri');
    return null;
  }

  const realmUrl = tryParseUrl(realm_uri);
  if (realmUrl === undefined) {
    logging.warn('notification realm_uri invalid as URL', { realm_uri });
    return null;
  }

  const urlMatches = [];
  accounts.forEach((account, i) => {
    if (account.realm.origin === realmUrl.origin) {
      urlMatches.push(i);
    }
  });

  if (urlMatches.length === 0) {
    // No match.  Either we logged out of this account and didn't
    // successfully tell the server to stop sending notifications (possibly
    // just a race -- this notification was sent before the logout); or
    // there's some confusion where the realm_uri we have is different from
    // the one the server sends in notifications.
    const knownUrls = accounts.map(({ realm }) => realm.href);
    logging.warn('notification realm_uri not found in accounts', {
      realm_uri,
      parsed_url: realmUrl,
      known_urls: knownUrls,
    });
    return null;
  }

  // TODO(server-2.1): Remove this, because user_id will always be present
  if (user_id === undefined) {
    if (urlMatches.length > 1) {
      logging.warn(
        'notification realm_uri ambiguous; multiple matches found; user_id missing (old server)',
        {
          realm_uri,
          parsed_url: realmUrl,
          match_count: urlMatches.length,
          unique_identities_count: new Set(urlMatches.map(matchIndex => accounts[matchIndex].email))
            .size,
        },
      );
      return null;
    } else {
      return urlMatches[0];
    }
  }

  // There may be multiple accounts in the notification's realm. Pick one
  // based on the notification's `user_id`.
  const userMatch = urlMatches.find(urlMatch => accounts[urlMatch].userId === user_id);
  if (userMatch == null) {
    // Maybe we didn't get a userId match because the correct account just
    // hasn't had its userId recorded on it yet. See jsdoc on the Account
    // type for when that is.
    const nullUserIdMatches = urlMatches.filter(urlMatch => accounts[urlMatch].userId === null);
    switch (nullUserIdMatches.length) {
      case 0:
        logging.warn(
          'notifications: No accounts found with matching realm and matching-or-null user ID',
        );
        return null;
      case 1:
        return nullUserIdMatches[0];
      default:
        logging.warn(
          'notifications: Multiple accounts found with matching realm and null user ID; could not choose',
          { nullUserIdMatchesCount: nullUserIdMatches.length },
        );
        return null;
    }
  }
  return userMatch;
};

export const getNarrowFromNotificationData = (
  data: Notification,
  allUsersByEmail: Map<string, UserOrBot>,
  streamsByName: Map<string, Stream>,
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

  // TODO: If the notification is in an unknown stream, or a 1:1 PM from an
  //   unknown user, give a better error.  (This can happen for the stream
  //   case if we were removed from the stream after the notification's
  //   message was sent.  It can also happen if the user or stream was just
  //   created, and we haven't yet learned about it in the event queue; see
  //   e068771d7, which fixed this issue for group PMs.)
  //
  //   This version just silently ignores the notification.
  //
  //   A nicer version would navigate to ChatScreen for that unknown
  //   conversation, which would show InvalidNarrow (with its sensible error
  //   message) and whatever the notification did tell us about the
  //   stream/user: in particular, the stream name.
  //
  //   But once Narrow objects stop relying on stream names (coming soon),
  //   doing that will require some alternate plumbing to pass the stream
  //   name through.  For now, we skip dealing with that; this should be an
  //   uncommon case, so we settle for not crashing.

  if (data.recipient_type === 'stream') {
    const stream = streamsByName.get(data.stream_name);
    return (stream && topicNarrow(stream.name, stream.stream_id, data.topic)) ?? null;
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

  return fromPushNotificationIOS(notification) || null;
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
export const handleInitialNotification = async (dispatch: GlobalDispatch) => {
  const data = await readInitialNotification();
  dispatch(narrowToNotification(data));
};

/**
 * Get the FCM token.
 *
 * Returns null (and logs a warning or error) if getting the token failed.
 */
const androidGetToken = async (dispatch: GlobalDispatch): Promise<mixed> => {
  try {
    return await NativeModules.Notifications.getToken();
  } catch (e) {
    // `getToken` failed.  That happens sometimes, apparently including
    // due to network errors: see #5061.  In that case all will be well
    // if the user later launches the app while on a working network.
    //
    // But maybe this can happen in other, non-transient situations too.
    // Log it so we can hope to find out if that's happening.
    const ackedPushTokens = dispatch((_, getState) =>
      getAccounts(getState()).map(a => a.ackedPushToken),
    );
    if (ackedPushTokens.some(t => t !== null) || ackedPushTokens.length === 0) {
      // It's probably a transient issue: we've previously gotten a
      // token (that we've even successfully sent to a server), or else
      // we have no accounts at all so we haven't had a chance to do so.
      logging.warn(`notif: getToken failed, but looks transient: ${e.message}`);
    } else {
      // Might not be transient!  The user might be persistently unable
      // to get push notifications.
      logging.error(`notif: getToken failed, seems persistent: ${e.message}`);
    }

    return null;
  }
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
  dispatch: GlobalDispatch;
  unsubs: Array<() => void> = [];

  constructor(dispatch: GlobalDispatch) {
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
  handleNotificationOpen: Notification => void = notification => {
    this.dispatch(narrowToNotification(notification));
  };

  /**
   * Private.
   *
   * @param deviceToken This should be a `?string`, but there's no typechecking
   *   at the registration site to allow us to ensure it. As we've been burned
   *   by unexpected types here before, we do the validation explicitly.
   */
  handleDeviceToken: mixed => Promise<void> = async deviceToken => {
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
  handleIOSRegistrationFailure: NotificationRegistrationFailedEvent => void = err => {
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
        const dataFromAPNs = fromPushNotificationIOS(notification);
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
      const token = await androidGetToken(this.dispatch);
      if (token !== null) {
        this.handleDeviceToken(token);
      }
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
