import { focusPing } from '../api';

import {
  APP_ONLINE,
  APP_OFFLINE,
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
