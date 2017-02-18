import { focusPing, getUsers } from '../api';
import {
  INIT_USERS,
  PRESENCE_RESPONSE,
} from '../constants';

export const sendFocusPing = (auth, hasFocus: boolean, newUserInput: boolean) =>
  async (dispatch) => {
    const response = await focusPing(auth, hasFocus, newUserInput);
    dispatch({
      type: PRESENCE_RESPONSE,
      presence: response,
    });
  };

export const initUsers = (users) => ({
  type: INIT_USERS,
  users,
});

export const fetchUsers = (auth) =>
  async (dispatch) =>
    dispatch(initUsers(await getUsers(auth)));

export const fetchUsersAndStatus = (auth) =>
  async (dispatch) => {
    await dispatch(fetchUsers(auth));
    await dispatch(sendFocusPing(auth, true, false));
  };
