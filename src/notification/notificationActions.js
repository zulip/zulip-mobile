/* @flow strict-local */
import type {
  Dispatch,
  GetState,
  UnackPushTokenAction,
  GotPushTokenAction,
  AckPushTokenAction,
} from '../types';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
} from '../notification';
import { getAuth, getPushToken } from '../selectors';
import { GOT_PUSH_TOKEN, ACK_PUSH_TOKEN, UNACK_PUSH_TOKEN } from '../actionConstants';

export const gotPushToken = (pushToken: string): GotPushTokenAction => ({
  type: GOT_PUSH_TOKEN,
  pushToken,
});

export const unackPushToken = (): UnackPushTokenAction => ({
  type: UNACK_PUSH_TOKEN,
});

export const ackPushToken = (pushToken: string): AckPushTokenAction => ({
  type: ACK_PUSH_TOKEN,
  pushToken,
});

export const initNotifications = () => (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const pushToken = getPushToken(getState());
  getNotificationToken(auth, pushToken, dispatch);
};

export const tryStopNotifications = () => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const pushToken = getPushToken(getState());
  innerStopNotifications(auth, pushToken, dispatch);
};
