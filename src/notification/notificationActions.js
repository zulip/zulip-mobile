/* @flow strict-local */
import { Platform } from 'react-native';

import type { Account, Dispatch, GetState, Identity, Action } from '../types';
import * as api from '../api';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
  getNarrowFromNotificationData,
  getAccountFromNotificationData,
} from '.';
import type { Notification } from './types';
import { getAuth, getActiveAccount } from '../selectors';
import { getSession, getAccounts } from '../directSelectors';
import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';
import { identityOfAccount, authOfAccount } from '../account/accountMisc';
import { getAllUsersByEmail, getAllUsersById, getOwnUserId } from '../users/userSelectors';
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

export const narrowToNotification = (data: ?Notification) => (
  dispatch: Dispatch,
  getState: GetState,
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
    getAllUsersById(state),
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
export const sendAllPushToken = () => async (dispatch: Dispatch, getState: GetState) => {
  const { pushToken } = getSession(getState());
  if (pushToken === null) {
    return;
  }
  const accounts = getAccounts(getState());
  await Promise.all(accounts.map(account => sendPushToken(dispatch, account, pushToken)));
};

/** Tell the active account's server about our device token, if needed. */
export const initNotifications = () => async (dispatch: Dispatch, getState: GetState) => {
  const { pushToken } = getSession(getState());
  if (pushToken === null) {
    // We don't have the token yet.  When we learn it, the listener will
    // update this and all other logged-in servers.  Try to learn it.
    //
    // On Android this shouldn't happen -- our Android-native code requests
    // the token early in startup and fires the event that tells it to our
    // JS code -- but it's harmless to try again.
    //
    // On iOS this is normal because getting the token may involve showing
    // the user a permissions modal, so we defer that until this point.
    getNotificationToken();
    return;
  }
  const account = getActiveAccount(getState());
  await sendPushToken(dispatch, account, pushToken);
};

export const tryStopNotifications = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { ackedPushToken } = getActiveAccount(getState());
  innerStopNotifications(auth, ackedPushToken, dispatch);
};
