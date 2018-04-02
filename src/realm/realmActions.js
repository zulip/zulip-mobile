/* @flow */
import type { GetState, Dispatch, Action, InitialRealmData } from '../types';
import { initializeNotifications } from '../utils/notifications';
import { getAuth } from '../selectors';

import { REALM_INIT, SAVE_TOKEN_PUSH, DELETE_TOKEN_PUSH } from '../actionConstants';

export const realmInit = (data: InitialRealmData): Action => ({
  type: REALM_INIT,
  data,
});

export const deleteTokenPush = (): Action => ({
  type: DELETE_TOKEN_PUSH,
});

const saveTokenPush = (pushToken: string, result: string, msg: string) => ({
  type: SAVE_TOKEN_PUSH,
  pushToken,
  result,
  msg,
});

export const initNotifications = (): Action => (dispatch: Dispatch, getState: GetState) => {
  initializeNotifications(getAuth(getState()), (token, msg, result) =>
    dispatch(saveTokenPush(token, result, msg)),
  );
};
