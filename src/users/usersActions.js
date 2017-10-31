/* @flow */
import type { Dispatch, Action, User, GetState } from '../types';
import { focusPing, getUsers } from '../api';
import { INIT_USERS, PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth } from '../selectors';

export const sendFocusPing = (
  hasFocus: boolean = true,
  newUserInput: boolean = false,
): Action => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  if (auth.realm === '' || auth.apiKey === '') {
    return; // not logged in
  }

  const response = await focusPing(auth, hasFocus, newUserInput);
  dispatch({
    type: PRESENCE_RESPONSE,
    presence: response.presences,
    serverTimestamp: response.server_timestamp,
  });
};

export const initUsers = (users: User[]): Action => ({
  type: INIT_USERS,
  users,
});

export const fetchUsers = (): Action => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initUsers(await getUsers(getAuth(getState()))));
