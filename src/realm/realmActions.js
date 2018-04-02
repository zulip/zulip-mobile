/* @flow */
import type {
  GetState,
  Dispatch,
  Action,
  InitialRealmData,
  RealmInitAction,
  DeleteTokenPushAction,
  SaveTokenPushAction,
} from '../types';
import { initializeNotifications } from '../utils/notifications';
import { getAuth } from '../selectors';

import { REALM_INIT, SAVE_TOKEN_PUSH, DELETE_TOKEN_PUSH } from '../actionConstants';

export const realmInit = (data: InitialRealmData): RealmInitAction => ({
  type: REALM_INIT,
  data,
});

export const deleteTokenPush = (): DeleteTokenPushAction => ({
  type: DELETE_TOKEN_PUSH,
});

export const saveTokenPush = (
  pushToken: string,
  result: string,
  msg: string,
): SaveTokenPushAction => ({
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
