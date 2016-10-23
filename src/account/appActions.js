import { focusPing } from '../api';

export const APP_ACTIVITY = 'APP_ACTIVITY';

export const appActivity = (auth) =>
  async (dispatch) =>
    await focusPing(auth, true, false);
