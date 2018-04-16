/* @flow */
import differenceInSeconds from 'date-fns/difference_in_seconds';

import type { Dispatch, GetState, Narrow, ApiUser, InitUsersAction } from '../types';
import { focusPing, getUsers, typing } from '../api';
import { INIT_USERS, PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth } from '../selectors';
import { isPrivateOrGroupNarrow } from '../utils/narrow';

let lastFocusPing = new Date();
let lastTypingStart = new Date();

export const sendFocusPing = (hasFocus: boolean = true, newUserInput: boolean = false) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
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

export const initUsers = (users: ApiUser[]): InitUsersAction => ({
  type: INIT_USERS,
  users,
});

export const fetchUsers = () => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initUsers(await getUsers(getAuth(getState()))));

export const sendTypingEvent = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (!isPrivateOrGroupNarrow(narrow)) {
    return;
  }

  if (differenceInSeconds(new Date(), lastTypingStart) > 15) {
    const auth = getAuth(getState());
    typing(auth, narrow[0].operand, 'start');
    lastTypingStart = new Date();
  }
};
