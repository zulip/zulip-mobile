import {focusPing, getUsers} from '../api';
import {PRESENCE_RESPONSE, GET_USER_RESPONSE} from '../constants';

export const sendFocusPing = (auth, hasFocus: boolean, newUserInput: boolean) =>
  async dispatch => {
    const response = await focusPing(auth, hasFocus, newUserInput);
    dispatch({
      type: PRESENCE_RESPONSE,
      presence: response,
    });
  };

export const fetchUsers = auth =>
  async dispatch => {
    const response = await getUsers(auth);
    dispatch({
      type: GET_USER_RESPONSE,
      users: response,
    });
  };

export const fetchUsersAndStatus = auth =>
  async dispatch => {
    await dispatch(fetchUsers(auth));
    await dispatch(sendFocusPing(auth, true, false));
  };
