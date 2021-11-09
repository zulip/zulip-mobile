/* @flow strict-local */
import { Platform } from 'react-native';

import type {
  Account,
  Dispatch,
  GlobalDispatch,
  Identity,
  AccountIndependentAction,
  AllAccountsAction,
  ThunkAction,
  GlobalThunkAction,
} from '../types';
import * as api from '../api';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
  getNarrowFromNotificationData,
  getAccountFromNotificationData,
} from '.';
import type { Notification } from './types';
import { getAuth } from '../selectors';
import { getGlobalSession, getAccounts } from '../directSelectors';
import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';
import { identityOfAccount, authOfAccount } from '../account/accountMisc';
import { getAllUsersByEmail, getOwnUserId } from '../users/userSelectors';
import { doNarrow } from '../message/messagesActions';
import { accountSwitch } from '../account/accountActions';
import { getIdentities, getAccount, tryGetActiveAccountState } from '../account/accountsSelectors';

export const gotPushToken = (pushToken: string | null): AccountIndependentAction => ({
  type: GOT_PUSH_TOKEN,
  pushToken,
});

export const unackPushToken = (identity: Identity): AllAccountsAction => ({
  type: UNACK_PUSH_TOKEN,
  identity,
});

const ackPushToken = (pushToken: string, identity: Identity): AllAccountsAction => ({
  type: ACK_PUSH_TOKEN,
  identity,
  pushToken,
});

export const narrowToNotification = (data: ?Notification): GlobalThunkAction<void> => (
  dispatch,
  getState,
) => {
  if (!data) {
    return;
  }

  const globalState = getState();
  const accountIndex = getAccountFromNotificationData(data, getIdentities(globalState));
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

/** Tell the given server about this device token, if it doesn't already know. */
const sendPushToken = async (
  // Why `Dispatch | GlobalDispatch`?  Well, this function is per-account...
  // but whereas virtually all our other per-account code is implicitly
  // about the active account, this is about a specific account it's
  // explicitly passed.  That makes it equally legitimate to call from
  // per-account or global code, and we do both.
  // TODO(#5006): Once we have per-account states for all accounts, make
  //   this an ordinary per-account action.
  dispatch: Dispatch | GlobalDispatch,
  account: Account | void,
  pushToken: string,
) => {
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

/** Tell all logged-in accounts' servers about our device token, as needed. */
export const sendAllPushToken = (): GlobalThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const { pushToken } = getGlobalSession(getState());
  if (pushToken === null) {
    return;
  }
  const accounts = getAccounts(getState());
  await Promise.all(accounts.map(account => sendPushToken(dispatch, account, pushToken)));
};

/** Tell this account's server about our device token, if needed. */
export const initNotifications = (): ThunkAction<Promise<void>> => async (
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
  await sendPushToken(dispatch, account, pushToken);
};

/** Ask this account's server to stop sending notifications to this device. */
// TODO: We don't call this in enough situations: see #3469.
//
// Also, doing this exclusively from the device is inherently unreliable;
// you should be able to log in from elsewhere and cut the device off from
// your account, including notifications, even when you don't have the
// device in your possession.  That's zulip/zulip#17939.
export const tryStopNotifications = (): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const auth = getAuth(getState());
  const { ackedPushToken } = getAccount(getState());
  innerStopNotifications(auth, ackedPushToken, dispatch);
};
