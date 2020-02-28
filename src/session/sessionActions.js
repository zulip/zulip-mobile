/* @flow strict-local */
import type { Action, Dimensions, Dispatch, GetState, Orientation } from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  DEAD_QUEUE,
  DEBUG_FLAG_TOGGLE,
  INIT_SAFE_AREA_INSETS,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
} from '../actionConstants';
import * as api from '../api';
import { getAuth } from '../selectors';

export const appOnline = (isOnline: boolean): Action => ({
  type: APP_ONLINE,
  isOnline,
});

export const deadQueue = (): Action => ({
  type: DEAD_QUEUE,
});

export const initSafeAreaInsets = (safeAreaInsets: Dimensions): Action => ({
  type: INIT_SAFE_AREA_INSETS,
  safeAreaInsets,
});

export const appOrientation = (orientation: Orientation): Action => ({
  type: APP_ORIENTATION,
  orientation,
});

export const startEditMessage = (messageId: number, topic: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const { raw_content } = await api.getRawMessageContent(getAuth(getState()), messageId);
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

export const debugFlagToggle = (key: string, value: boolean): Action => ({
  type: DEBUG_FLAG_TOGGLE,
  key,
  value,
});
