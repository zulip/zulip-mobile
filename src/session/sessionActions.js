/* @flow */
import type { Action, Dimensions, Dispatch, GetState, Orientation } from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  APP_STATE,
  DEAD_QUEUE,
  DEBUG_FLAG_TOGGLE,
  INIT_SAFE_AREA_INSETS,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
} from '../actionConstants';
import { getMessageContentById } from '../api';
import { getAuth, getIsOnline, getIsActive } from '../selectors';

export const appOnline = (isOnline: boolean) => (
  dispatch: Dispatch,
  getState: GetState,
): ?Action => {
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
): ?Action => {
  if (isActive !== getIsActive(getState())) {
    dispatch({
      type: APP_STATE,
      isActive,
    });
  }
};

export const deadQueue = (): Action => ({
  type: DEAD_QUEUE,
});

export const initSafeAreaInsets = (safeAreaInsets: Dimensions): Action => ({
  type: INIT_SAFE_AREA_INSETS,
  safeAreaInsets,
});

export const appOrientation = (orientation: Orientation) => (
  dispatch: Dispatch,
  getState: GetState,
): ?Action => {
  if (orientation !== getState().session.orientation) {
    dispatch({
      type: APP_ORIENTATION,
      orientation,
    });
  }
};

export const startEditMessage = (messageId: number, topic: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const { raw_content } = await getMessageContentById(getAuth(getState()), messageId);
  dispatch({
    type: START_EDIT_MESSAGE,
    messageId,
    message: raw_content,
    topic,
  });
};

export const cancelEditMessage = (): Action => ({
  type: CANCEL_EDIT_MESSAGE,
});

export const debugFlagToggle = (key: string, value: any): Action => ({
  type: DEBUG_FLAG_TOGGLE,
  key,
  value,
});
