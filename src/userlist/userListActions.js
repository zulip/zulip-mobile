import { Auth, focusPing } from '../api/ApiClient';

export const PRESENCE_RESPONSE = 'PRESENCE_RESPONSE';
export const USER_FILTER_CHANGE = 'USER_FILTER_CHANGE';

export const sendFocusPing = (auth: Auth, hasFocus: boolean, newUserInput: boolean) =>
  async (dispatch) => {
    const response = await focusPing(auth, hasFocus, newUserInput);
    dispatch({
      type: PRESENCE_RESPONSE,
      presence: response,
    });
  };
