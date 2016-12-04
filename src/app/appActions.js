import {
  APP_ONLINE,
  APP_OFFLINE,
} from '../constants';

export const appOnline = () => ({
  type: APP_ONLINE,
});

export const appOffline = () => ({
  type: APP_OFFLINE,
});
