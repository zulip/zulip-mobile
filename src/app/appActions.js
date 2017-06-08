/* @flow */
import type { Action } from '../types';
import {
  APP_ONLINE,
  APP_ORIENTATION,
  APP_STATE,
  CANCEL_EDIT_MESSAGE,
  START_EDIT_MESSAGE
} from '../actionConstants';
import getSingleMessage from '../api/getSingleMessage';

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

export const startEditMessage = (auth, messageId) =>
    async (dispatch) => {
      const message = await getSingleMessage(auth, messageId);
      dispatch({
        type: START_EDIT_MESSAGE,
        messageId,
        message
      });
    };

export const cancelEditMessage = () => ({
  type: CANCEL_EDIT_MESSAGE,
});
