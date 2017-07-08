/* @flow */
import type { Dispatch, Auth, Action, User } from '../types';
import { focusPing, getUsers } from '../api';
import { INIT_USERS, PRESENCE_RESPONSE } from '../actionConstants';

export const sendFocusPing = (auth: Auth, hasFocus: boolean, newUserInput: boolean): Action =>
  async (dispatch: Dispatch) => {
    const response = await focusPing(auth, hasFocus, newUserInput);
    dispatch({
      type: PRESENCE_RESPONSE,
      presence: response,
    });
  };

export const initUsers = (users: User[]): Action => ({
  type: INIT_USERS,
  users,
});

export const fetchUsers = (auth: Auth): Action =>
  async (dispatch: Dispatch) =>
    dispatch(initUsers(await getUsers(auth)));

export const fetchUsersAndStatus = (auth: Auth): Action =>
  async (dispatch: Dispatch) => {
    await dispatch(fetchUsers(auth));
    await dispatch(sendFocusPing(auth, true, false));
  };
