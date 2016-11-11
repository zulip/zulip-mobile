import { focusPing } from '../api';

export const APP_ACTIVITY = 'APP_ACTIVITY';
export const APP_ONLINE = 'APP_OFFLINE';
export const APP_OFFLINE = 'APP_OFFLINE';

export const appActivity = (auth) =>
  async (dispatch) =>
    await focusPing(auth, true, false);

export const appOniline = () => ({
  type: APP_ONLINE,
});

export const appOffline = () => ({
  type: APP_OFFLINE,
});
