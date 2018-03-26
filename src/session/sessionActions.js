/* @flow */
import type {
  AppOnlineAction,
  AppStateAction,
  AppRefreshAction,
  CancelEditMessageAction,
  AppOrientationAction,
  DebugFlagToggleAction,
  InitSafeAreaInsetsAction,
  Dimensions,
  Dispatch,
  GetState,
} from '../types';
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
} from '../actionConstants';
import { getMessageById } from '../api';
import { getAuth, getIsOnline, getIsActive } from '../selectors';

export const appOnline = (isOnline: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
): ?AppOnlineAction => {
  if (isOnline !== getIsOnline(getState())) {
    dispatch({
      type: APP_ONLINE,
      isOnline,
    });
  }
};

export const appState = (isActive: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
): ?AppStateAction => {
  if (isActive !== getIsActive(getState())) {
    dispatch({
      type: APP_STATE,
      isActive,
    });
  }
};

export const appRefresh = (): AppRefreshAction => ({
  type: APP_REFRESH,
});

export const initSafeAreaInsets = (safeAreaInsets: Dimensions): InitSafeAreaInsetsAction => ({
  type: INIT_SAFE_AREA_INSETS,
  ...safeAreaInsets,
});

export const appOrientation = (orientation: string) => (
  dispatch: Dispatch,
  getState: GetState,
): ?AppOrientationAction => {
  if (orientation !== getState().session.orientation) {
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

export const cancelEditMessage = (): CancelEditMessageAction => ({
  type: CANCEL_EDIT_MESSAGE,
});

export const debugFlagToggle = (key: string, value: any): DebugFlagToggleAction => ({
  type: DEBUG_FLAG_TOGGLE,
  key,
  value,
});
