/* @flow */
import type { Action } from '../types';
import { APP_ONLINE, APP_ORIENTATION, APP_STATE } from '../actionConstants';

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
