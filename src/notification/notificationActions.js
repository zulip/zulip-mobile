/* @flow strict-local */
import type {
  Dispatch,
  GetState,
  DeleteTokenPushAction,
  GotPushTokenAction,
  SaveTokenPushAction,
} from '../types';
import {
  getNotificationToken,
  tryStopNotifications as innerStopNotifications,
} from '../notification';
import { getAuth, getPushToken } from '../selectors';
import { GOT_PUSH_TOKEN, SAVE_TOKEN_PUSH, DELETE_TOKEN_PUSH } from '../actionConstants';

export const gotPushToken = (pushToken: string): GotPushTokenAction => ({
  type: GOT_PUSH_TOKEN,
  pushToken,
});

export const deleteTokenPush = (): DeleteTokenPushAction => ({
  type: DELETE_TOKEN_PUSH,
});

export const saveTokenPush = (pushToken: string): SaveTokenPushAction => ({
  type: SAVE_TOKEN_PUSH,
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
