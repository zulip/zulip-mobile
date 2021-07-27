/* @flow strict-local */
import { Platform } from 'react-native';

import type { Account, Dispatch, Identity, Action, ThunkAction } from '../types';
import * as api from '../api';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
  getNarrowFromNotificationData,
  getAccountFromNotificationData,
  // eslint-disable-next-line import/no-useless-path-segments
} from './'; // Like '.'; see #4818.
import type { Notification } from './types';
import { getAuth, getActiveAccount } from '../selectors';
import { getSession, getAccounts } from '../directSelectors';
import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';
import { identityOfAccount, authOfAccount } from '../account/accountMisc';
import { getAllUsersByEmail, getOwnUserId } from '../users/userSelectors';
import { doNarrow } from '../message/messagesActions';
import { accountSwitch } from '../account/accountActions';
import { getIdentities } from '../account/accountsSelectors';

export const gotPushToken = (pushToken: string | null): Action => ({
  type: GOT_PUSH_TOKEN,
  pushToken,
});

export const unackPushToken = (identity: Identity): Action => ({
  type: UNACK_PUSH_TOKEN,
  identity,
});

const ackPushToken = (pushToken: string, identity: Identity): Action => ({
  type: ACK_PUSH_TOKEN,
  identity,
  pushToken,
});

export const narrowToNotification = (data: ?Notification): ThunkAction<void> => (
  dispatch,
  getState,
) => {
  if (!data) {
    return;
  }

  const state = getState();
  const accountIndex = getAccountFromNotificationData(data, getIdentities(state));
  if (accountIndex !== null && accountIndex > 0) {
    // Notification is for a non-active account.  Switch there.
    dispatch(accountSwitch(accountIndex));
    // TODO actually narrow to conversation.
    return;
  }

  const narrow = getNarrowFromNotificationData(
    data,
    getAllUsersByEmail(state),
    getOwnUserId(state),
  );
  if (narrow) {
    dispatch(doNarrow(narrow));
  }
};

/** Tell the given server about this device token, if it doesn't already know. */
const sendPushToken = async (dispatch: Dispatch, account: Account | void, pushToken: string) => {
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
export const sendAllPushToken = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  const { pushToken } = getSession(getState());
  if (pushToken === null) {
    return;
  }
  const accounts = getAccounts(getState());
  await Promise.all(accounts.map(account => sendPushToken(dispatch, account, pushToken)));
};

/** Tell the active account's server about our device token, if needed. */
export const initNotifications = (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  const { pushToken } = getSession(getState());
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
  const account = getActiveAccount(getState());
  await sendPushToken(dispatch, account, pushToken);
};

export const tryStopNotifications = (): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const auth = getAuth(getState());
  const { ackedPushToken } = getActiveAccount(getState());
  innerStopNotifications(auth, ackedPushToken, dispatch);
};
