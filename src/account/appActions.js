import { Auth, focusPing } from '../api/apiClient';

export const APP_ACTIVITY = 'APP_ACTIVITY';

export const appActivity = (auth: Auth) =>
  async (dispatch) =>
    await focusPing(auth, true, false);
