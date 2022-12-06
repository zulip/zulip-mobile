/**
 * Device tokens for notifications: getting them, reporting them, recording them.
 *
 * @flow strict-local
 */
import { NativeModules, Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';
import type {
  Account,
  Identity,
  AccountIndependentAction,
  AllAccountsAction,
  ThunkAction,
  GlobalThunkAction,
} from '../types';
import type { JSONable } from '../utils/jsonable';
import * as api from '../api';
import { getGlobalSession, getAccounts } from '../directSelectors';
import { identityOfAccount, authOfAccount, identityOfAuth } from '../account/accountMisc';
import { getAccount } from '../account/accountsSelectors';
import * as logging from '../utils/logging';

/**
 * Get the FCM token.
 *
 * Returns null (and logs a warning or error) if getting the token failed.
 */
export const androidGetToken =
  (): GlobalThunkAction<Promise<mixed>> => async (dispatch, getState) => {
    try {
      return await NativeModules.Notifications.getToken();
    } catch (e) {
      // `getToken` failed.  That happens sometimes, apparently including
      // due to network errors: see #5061.  In that case all will be well
      // if the user later launches the app while on a working network.
      //
      // But maybe this can happen in other, non-transient situations too.
      // Log it so we can hope to find out if that's happening.
      const ackedPushTokens = getAccounts(getState()).map(a => a.ackedPushToken);
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

const gotPushToken = (pushToken: string | null): AccountIndependentAction => ({
  type: GOT_PUSH_TOKEN,
  pushToken,
});

const unackPushToken = (identity: Identity): AllAccountsAction => ({
  type: UNACK_PUSH_TOKEN,
  identity,
});

const ackPushToken = (pushToken: string, identity: Identity): AllAccountsAction => ({
  type: ACK_PUSH_TOKEN,
  identity,
  pushToken,
});

/** Tell the given server about this device token, if it doesn't already know. */
const sendPushToken =
  (
    account: Account | void,
    pushToken: string,
  ): GlobalThunkAction<Promise<void>> & ThunkAction<Promise<void>> =>
  // Why both GlobalThunkAction and ThunkAction?  Well, this function is
  // per-account... but whereas virtually all our other per-account code is
  // implicitly about the active account, this is about a specific account
  // it's explicitly passed.  That makes it equally legitimate to call from
  // per-account or global code, and we do both.
  // TODO(#5006): Once we have per-account states for all accounts, make
  //   this an ordinary per-account action.
  async dispatch => {
    if (!account || account.apiKey === '') {
      // We've logged out of the account and/or forgotten it.  Shrug.
      return;
    }
    if (account.ackedPushToken === pushToken) {
      // The server already knows this device token.
      return;
    }
    const auth = authOfAccount(account);
    await api.savePushToken(auth, Platform.OS, pushToken);
    dispatch(ackPushToken(pushToken, identityOfAccount(account)));
  };

/** Tell this account's server about our device token, if needed. */
export const initNotifications =
  (): ThunkAction<Promise<void>> =>
  async (
    dispatch,
    getState,
    { getGlobalSession }, // eslint-disable-line no-shadow
  ) => {
    const { pushToken } = getGlobalSession();
    if (pushToken === null) {
      // Probably, we just don't have the token yet.  When we learn it,
      // the listener will update this and all other logged-in servers.
      // Try to learn it.
      //
      // Or, if we *have* gotten something for the token and it was
      // `null`, we're probably on Android; see note on
      // `SessionState.pushToken`. It's harmless to call
      // `getNotificationToken` in that case; it does nothing on
      // Android.
      //
      // On iOS this is normal because getting the token may involve
      // showing the user a permissions modal, so we defer that until
      // this point.
      getNotificationToken();
      return;
    }
    const account = getAccount(getState());
    await dispatch(sendPushToken(account, pushToken));
  };

/** Tell all logged-in accounts' servers about our device token, as needed. */
const sendAllPushToken = (): GlobalThunkAction<Promise<void>> => async (dispatch, getState) => {
  const { pushToken } = getGlobalSession(getState());
  if (pushToken === null) {
    return;
  }
  const accounts = getAccounts(getState());
  await Promise.all(accounts.map(account => dispatch(sendPushToken(account, pushToken))));
};

/**
 * Act on having learned a new device token.
 *
 * @param deviceToken This should be a `?string`, but there's no typechecking
 *   at the registration site to allow us to ensure it. As we've been burned
 *   by unexpected types here before, we do the validation explicitly.
 */
export const handleDeviceToken =
  (deviceToken: mixed): GlobalThunkAction<Promise<void>> =>
  async dispatch => {
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

    dispatch(gotPushToken(deviceToken));
    await dispatch(sendAllPushToken());
  };

/** Ask this account's server to stop sending notifications to this device. */
// Doing this exclusively from the device is inherently unreliable; you
// should be able to log in from elsewhere and cut the device off from your
// account, including notifications, even when you don't have the device in
// your possession.  That's zulip/zulip#17939.
export const tryStopNotifications =
  (account: Account): GlobalThunkAction<Promise<void>> & ThunkAction<Promise<void>> =>
  // Why both GlobalThunkAction and ThunkAction?  Well, this function is
  // per-account... but whereas virtually all our other per-account code is
  // implicitly about the active account, this is about a specific account
  // it's explicitly passed.  That makes it equally legitimate to call from
  // per-account or global code, and we do both.
  // TODO(#5006): Once we have per-account states for all accounts, make
  //   this an ordinary per-account action.
  async dispatch => {
    const auth = authOfAccount(account);
    const { ackedPushToken } = account;
    if (ackedPushToken !== null) {
      dispatch(unackPushToken(identityOfAuth(auth)));
      try {
        await api.forgetPushToken(auth, Platform.OS, ackedPushToken);
      } catch (e) {
        logging.warn(e);
      }
    }
  };
