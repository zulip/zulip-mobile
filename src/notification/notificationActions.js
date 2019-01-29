/* @flow strict-local */
import { Platform } from 'react-native';
import type { Account, Dispatch, GetState, Identity, Action } from '../types';
/* eslint-disable import/no-named-as-default-member */
import api from '../api';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
} from '../notification';
import { getAuth, getActiveAccount } from '../selectors';
import { getSession } from '../directSelectors';
import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';
import { authOfAccount, getAccountsByIdentity } from '../account/accountsSelectors';
import { identityOfAccount } from '../account/accountMisc';

export const gotPushToken = (pushToken: string): Action => ({
  type: GOT_PUSH_TOKEN,
  pushToken,
});

export const unackPushToken = (identity: Identity): Action => ({
  type: UNACK_PUSH_TOKEN,
  identity,
});

export const ackPushToken = (pushToken: string, identity: Identity): Action => ({
  type: ACK_PUSH_TOKEN,
  identity,
  pushToken,
});

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

/** Tell the given server about our device token, if needed. */
export const maybeSendPushToken = (identity: Identity) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const { pushToken } = getSession(getState());
  if (pushToken === null) {
    return;
  }
  const account = getAccountsByIdentity(getState())(identity);
  await sendPushToken(dispatch, account, pushToken);
};

export const initNotifications = () => (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { ackedPushToken } = getActiveAccount(getState());
  getNotificationToken(auth, ackedPushToken, dispatch);
};

export const tryStopNotifications = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { ackedPushToken } = getActiveAccount(getState());
  innerStopNotifications(auth, ackedPushToken, dispatch);
};
