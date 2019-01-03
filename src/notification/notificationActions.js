/* @flow strict-local */
import { Platform } from 'react-native';
import type {
  Auth,
  Dispatch,
  GetState,
  Identity,
  UnackPushTokenAction,
  GotPushTokenAction,
  AckPushTokenAction,
} from '../types';
/* eslint-disable import/no-named-as-default-member */
import api from '../api';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
} from '../notification';
import { getAuth, getActiveAccount } from '../selectors';
import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';
import { identityOfAuth } from '../account/accountMisc';

export const gotPushToken = (pushToken: string): GotPushTokenAction => ({
  type: GOT_PUSH_TOKEN,
  pushToken,
});

export const unackPushToken = (identity: Identity): UnackPushTokenAction => ({
  type: UNACK_PUSH_TOKEN,
  identity,
});

export const ackPushToken = (pushToken: string, identity: Identity): AckPushTokenAction => ({
  type: ACK_PUSH_TOKEN,
  identity,
  pushToken,
});

/** Tell the given server about this device token. */
export const sendPushToken = (auth: Auth, deviceToken: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await api.savePushToken(auth, Platform.OS, deviceToken);
  dispatch(ackPushToken(deviceToken, identityOfAuth(auth)));
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
