/* @flow */
import differenceInSeconds from 'date-fns/difference_in_seconds';

import type { Dispatch, Action, User, GetState } from '../types';
import { focusPing, getUsers } from '../api';
import { INIT_USERS, PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth } from '../selectors';

let lastFocusPing = new Date();

export const sendFocusPing = (
  hasFocus: boolean = true,
  newUserInput: boolean = false,
): Action => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  if (auth.realm === '' || auth.apiKey === '') {
    return; // not logged in
  }

  if (differenceInSeconds(new Date(), lastFocusPing) < 60) {
    return;
  }

  lastFocusPing = new Date();

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
