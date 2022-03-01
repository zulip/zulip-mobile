/**
 * Opening a notification.
 *
 * @flow strict-local
 */
import { NativeModules, Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import type { Notification } from './types';
import type { Account, GlobalThunkAction, Narrow, Stream, UserId, UserOrBot } from '../types';
import { topicNarrow, pm1to1NarrowFromUser, pmNarrowFromRecipients } from '../utils/narrow';
import * as logging from '../utils/logging';
import { fromPushNotificationIOS } from './extract';
import { tryParseUrl } from '../utils/url';
import { pmKeyRecipientsFromIds } from '../utils/recipient';
import { makeUserId } from '../api/idTypes';
import { getStreamsByName } from '../selectors';
import { getAccounts } from '../directSelectors';
import { getAllUsersByEmail, getOwnUserId } from '../users/userSelectors';
import { doNarrow } from '../message/messagesActions';
import { accountSwitch } from '../account/accountActions';
import { tryGetActiveAccountState } from '../account/accountsSelectors';

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
  //   A nice version would navigate to ChatScreen for that unknown
  //   conversation, which would show InvalidNarrow (with its sensible error
  //   message) and whatever the notification did tell us about the
  //   stream/user: in particular, the stream name.
  //
  //   But because Narrow objects don't carry stream names, doing that will
  //   require some alternate plumbing to pass the stream name through.  For
  //   now, we skip dealing with that; this should be an uncommon case, so
  //   we settle for not crashing.
  //
  //   Specifically, if the notification comes with a stream ID or user IDs,
  //   we navigate to a ChatScreen and it shows InvalidNarrow, but we don't
  //   report the stream name etc.  If not, we ignore the notification.

  if (data.recipient_type === 'stream') {
    // TODO(server-5.0): Always use the stream ID (#3918).
    if (data.stream_id !== undefined) {
      // Ideally we'd also record the stream name here, for a better error
      // UX in case the stream is unknown.  See long TODO comment above.
      return topicNarrow(data.stream_id, data.topic);
    }
    const stream = streamsByName.get(data.stream_name);
    return (stream && topicNarrow(stream.stream_id, data.topic)) ?? null;
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

export const narrowToNotification = (data: ?Notification): GlobalThunkAction<void> => (
  dispatch,
  getState,
) => {
  if (!data) {
    return;
  }

  const globalState = getState();
  const accountIndex = getAccountFromNotificationData(data, getAccounts(globalState));
  if (accountIndex !== null && accountIndex > 0) {
    // Notification is for a non-active account.  Switch there.
    dispatch(accountSwitch(accountIndex));
    // TODO actually narrow to conversation.
    return;
  }

  // If accountIndex is null, then `getAccountFromNotificationData` has
  // already logged a warning.  We go on to treat it as if it's 0, i.e. the
  // active account, in the hopes that the user has one account they use
  // regularly and it's the same one this notification is for.

  const state = tryGetActiveAccountState(globalState);
  if (!state) {
    // There are no accounts at all.  (Which also means accountIndex is null
    // and we've already logged a warning.)
    return;
  }

  const narrow = getNarrowFromNotificationData(
    data,
    getAllUsersByEmail(state),
    getStreamsByName(state),
    getOwnUserId(state),
  );
  if (narrow) {
    // We have a GlobalDispatch, because this is a global thunk action --
    // at the top of the function, we didn't yet know which account was
    // intended and had to work that out.  But now we know we're working on
    // the active account, and want to dispatch a per-account action there.
    // For the present, we just use the fact that our GlobalDispatch value
    // is the same function as we use for Dispatch.
    // TODO(#5006): perhaps have an extra `activeAccountDispatch: Dispatch`?
    (dispatch: $FlowFixMe)(doNarrow(narrow));
  }
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
export const handleInitialNotification = (): GlobalThunkAction<Promise<void>> => async dispatch => {
  const data = await readInitialNotification();
  dispatch(narrowToNotification(data));
};
