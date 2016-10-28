import { focusPing } from '../api';

import {
  APP_ACTIVITY,
  APP_ONLINE,
  APP_OFFLINE,
  INIT_ROUTES,
  HTTP_UNAUTHORIZED,
} from '../constants';

export const appActivity = (auth) =>
  async (dispatch) =>
    await focusPing(auth, true, false);

export const appOniline = () => ({
  type: APP_ONLINE,
});

export const appOffline = () => ({
  type: APP_OFFLINE,
});
