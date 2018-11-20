/* @flow */
import differenceInSeconds from 'date-fns/difference_in_seconds';

import type { Dispatch, GetState, Narrow } from '../types';
import { focusPing, typing } from '../api';
import { PRESENCE_RESPONSE } from '../actionConstants';
import { getActiveAccount } from '../selectors';
import { isPrivateOrGroupNarrow } from '../utils/narrow';

let lastFocusPing = new Date();
let lastTypingStart = new Date();

export const sendFocusPing = (hasFocus: boolean = true, newUserInput: boolean = false) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getActiveAccount(getState());
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

export const sendTypingEvent = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (!isPrivateOrGroupNarrow(narrow)) {
    return;
  }

  if (differenceInSeconds(new Date(), lastTypingStart) > 15) {
    const auth = getActiveAccount(getState());
    typing(auth, narrow[0].operand, 'start');
    lastTypingStart = new Date();
  }
};
