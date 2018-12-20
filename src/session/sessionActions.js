/* @flow */
import type {
  AppOnlineAction,
  AppStateAction,
  DeadQueueAction,
  AppOrientationAction,
  DebugFlagToggleAction,
  InitSafeAreaInsetsAction,
  Dimensions,
  Dispatch,
  GetState,
  Orientation,
} from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  APP_STATE,
  DEAD_QUEUE,
  DEBUG_FLAG_TOGGLE,
  INIT_SAFE_AREA_INSETS,
} from '../actionConstants';
import { getIsOnline, getIsActive } from '../selectors';

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

export const deadQueue = (): DeadQueueAction => ({
  type: DEAD_QUEUE,
});

export const initSafeAreaInsets = (safeAreaInsets: Dimensions): InitSafeAreaInsetsAction => ({
  type: INIT_SAFE_AREA_INSETS,
  safeAreaInsets,
});

export const appOrientation = (orientation: Orientation) => (
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

export const debugFlagToggle = (key: string, value: any): DebugFlagToggleAction => ({
  type: DEBUG_FLAG_TOGGLE,
  key,
  value,
});
