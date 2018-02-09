/* @flow */
import type { Action, DimensionsType, Dispatch, GetState } from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  APP_STATE,
  APP_REFRESH,
  DEBUG_FLAG_TOGGLE,
  INIT_SAFE_AREA_INSETS,
  TOGGLE_COMPOSE_TOOLS,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
  SAVE_INTIAL_NOTIFICATION,
} from '../actionConstants';
import { getMessageById } from '../api';
import { getAuth } from '../selectors';

export const appOnline = (isOnline: boolean): Action => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (isOnline !== getState().app.isOnline) {
    dispatch({
      type: APP_ONLINE,
      isOnline,
    });
  }
};

export const appState = (isActive: boolean): Action => ({
  type: APP_STATE,
  isActive,
});

export const appRefresh = () => ({
  type: APP_REFRESH,
});

export const initSafeAreaInsets = (safeAreaInsets: DimensionsType) => ({
  type: INIT_SAFE_AREA_INSETS,
  ...safeAreaInsets,
});

export const appOrientation = (orientation: string): Action => (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (orientation !== getState().app.orientation) {
    dispatch({
      type: APP_ORIENTATION,
      orientation,
    });
  }
};

export const toggleComposeTools = () => ({
  type: TOGGLE_COMPOSE_TOOLS,
});

export const startEditMessage = (messageId: number, topic: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const message = await getMessageById(getAuth(getState()), messageId);
  dispatch({
    type: START_EDIT_MESSAGE,
    messageId,
    message,
    topic,
  });
};

export const cancelEditMessage = () => ({
  type: CANCEL_EDIT_MESSAGE,
});

export const debugFlagToggle = (key: string, value: any) => ({
  type: DEBUG_FLAG_TOGGLE,
  key,
  value,
});

export const saveInitialNotificationDetails = (value: {}) => ({
  type: SAVE_INTIAL_NOTIFICATION,
  value,
});
