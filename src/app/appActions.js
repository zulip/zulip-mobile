import {
  APP_ONLINE,
} from '../constants';

export const appOnline = (isOnline: boolean) => ({
  type: APP_ONLINE,
  isOnline,
});
