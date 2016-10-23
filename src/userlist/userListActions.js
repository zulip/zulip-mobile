import { focusPing, getUsers } from '../api';

export const PRESENCE_RESPONSE = 'PRESENCE_RESPONSE';
export const GET_USER_RESPONSE = 'GET_USER_RESPONSE';

export const sendFocusPing = (auth, hasFocus: boolean, newUserInput: boolean) =>
  async (dispatch) => {
    const response = await focusPing(auth, hasFocus, newUserInput);
    dispatch({
      type: PRESENCE_RESPONSE,
      presence: response,
    });
  };

export const sendGetUsers = (auth) =>
  async (dispatch) => {
    const response = await getUsers(auth);
    dispatch({
      type: GET_USER_RESPONSE,
      users: response,
    });
  };

export const sendInitialGetUsers = (auth) =>
  async (dispatch) => {
    await dispatch(sendGetUsers(auth));
    await dispatch(sendFocusPing(auth, true, false));
  };
