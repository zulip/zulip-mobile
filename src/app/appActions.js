import {
  APP_ONLINE,
  APP_ORIENTATION,
  APP_STATE,
} from '../actionConstants';

export const appOnline = (isOnline: boolean) => ({
  type: APP_ONLINE,
  isOnline,
});

export const appState = (isActive: boolean) => ({
  type: APP_STATE,
  isActive,
});

export const appOrientation = (orientation: string) => ({
  type: APP_ORIENTATION,
  orientation,
});
