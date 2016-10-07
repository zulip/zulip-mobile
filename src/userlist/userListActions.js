import { Auth, focusPing, getUsers } from '../api/apiClient';

export const PRESENCE_RESPONSE = 'PRESENCE_RESPONSE';
export const GET_USER_RESPONSE = 'GET_USER_RESPONSE';

export const sendFocusPing = (auth: Auth, hasFocus: boolean, newUserInput: boolean) =>
  async (dispatch) => {
    const response = await focusPing(auth, hasFocus, newUserInput);
    dispatch({
      type: PRESENCE_RESPONSE,
      presence: response,
    });
  };

export const sendGetUsers = (auth: Auth) =>
  async (dispatch) => {
    const response = await getUsers(auth);
    dispatch({
      type: GET_USER_RESPONSE,
      users: response,
    });
  };
