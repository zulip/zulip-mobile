/* @flow */
import type { Dispatch, Action, User, GetState } from '../types';
import { focusPing, getUsers } from '../api';
import { INIT_USERS, PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth } from '../selectors';

export const sendFocusPing = (hasFocus: boolean, newUserInput: boolean): Action => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const response = await focusPing(getAuth(getState()), hasFocus, newUserInput);
  dispatch({
    type: PRESENCE_RESPONSE,
    presence: response,
  });
};

export const initUsers = (users: User[]): Action => ({
  type: INIT_USERS,
  users,
});

export const fetchUsers = (): Action => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initUsers(await getUsers(getAuth(getState()))));

export const fetchUsersAndStatus = (): Action => async (dispatch: Dispatch) => {
  await dispatch(fetchUsers());
  await dispatch(sendFocusPing(true, false));
};
