/* @flow */
import type { Action, Dispatch, GetState } from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  APP_STATE,
  APP_REFRESH,
  TOGGLE_COMPOSE_TOOLS,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
} from '../actionConstants';
import getSingleMessage from '../api/getSingleMessage';
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

export const startEditMessage = (messageId: number) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const message = await getSingleMessage(getAuth(getState()), messageId);
  dispatch({
    type: START_EDIT_MESSAGE,
    messageId,
    message,
  });
};

export const cancelEditMessage = () => ({
  type: CANCEL_EDIT_MESSAGE,
});
