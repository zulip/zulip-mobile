/* @flow */
import type { Action, Dispatch, GetState } from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  APP_STATE,
  TOGGLE_COMPOSE_TOOLS,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE,
} from '../actionConstants';
import getSingleMessage from '../api/getSingleMessage';
import { getAuth } from '../selectors';

export const appOnline = (isOnline: boolean): Action => ({
  type: APP_ONLINE,
  isOnline,
});

export const appState = (isActive: boolean): Action => ({
  type: APP_STATE,
  isActive,
});

export const appOrientation = (orientation: string): Action => ({
  type: APP_ORIENTATION,
  orientation,
});

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
