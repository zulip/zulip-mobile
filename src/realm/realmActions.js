/* @flow */
import type {
  Auth,
  GetState,
  Dispatch,
  RealmFilter,
  InitialData,
  RealmInitAction,
  DeleteTokenPushAction,
  SaveTokenPushAction,
  InitRealmEmojiAction,
  InitRealmFilterAction,
} from '../types';
import { initializeNotifications } from '../utils/notifications';
import { getAuth } from '../selectors';
import { getRealmEmojis, getRealmFilters } from '../api';

import {
  REALM_INIT,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
  INIT_REALM_EMOJI,
  INIT_REALM_FILTER,
} from '../actionConstants';

export const realmInit = (data: InitialData): RealmInitAction => ({
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

export const initNotifications = () => (dispatch: Dispatch, getState: GetState) => {
  initializeNotifications(getAuth(getState()), (token, msg, result) => {
    dispatch(saveTokenPush(token, result, msg));
  });
};

export const initRealmEmojis = (emojis: Object): InitRealmEmojiAction => ({
  type: INIT_REALM_EMOJI,
  emojis,
});

export const fetchRealmEmojis = (auth: Auth) => async (dispatch: Dispatch) =>
  dispatch(initRealmEmojis(await getRealmEmojis(auth)));

export const initRealmFilters = (filters: RealmFilter[]): InitRealmFilterAction => ({
  type: INIT_REALM_FILTER,
  filters,
});

export const fetchRealmFilters = (auth: Auth) => async (dispatch: Dispatch) =>
  dispatch(initRealmFilters(await getRealmFilters(auth)));
