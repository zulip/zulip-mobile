import {
  APP_ONLINE,
  APP_ORIENTATION,
} from '../constants';

export const appOnline = (isOnline: boolean) => ({
  type: APP_ONLINE,
  isOnline,
});

export const appOrientation = (orientation: string) => ({
  type: APP_ORIENTATION,
  orientation,
});
