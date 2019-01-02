/* @flow strict-local */
import type {
  Dispatch,
  GetState,
  Identity,
  UnackPushTokenAction,
  GotPushTokenAction,
  AckPushTokenAction,
} from '../types';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
} from '../notification';
import { getAuth, getActiveAccount } from '../selectors';
import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';

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
