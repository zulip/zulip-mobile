/* @flow strict-local */
import differenceInSeconds from 'date-fns/difference_in_seconds';

import type { Dispatch, GetState, Narrow } from '../types';
import * as api from '../api';
import { PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth, tryGetAuth } from '../selectors';
import { isPrivateOrGroupNarrow } from '../utils/narrow';

let lastReportPresence = new Date(0);
let lastTypingStart = new Date(0);

export const reportPresence = (hasFocus: boolean = true, newUserInput: boolean = false) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = tryGetAuth(getState());
  if (!auth) {
    return; // not logged in
  }

  const now = new Date();
  if (differenceInSeconds(now, lastReportPresence) < 60) {
    return;
  }
  lastReportPresence = now;

  const response = await api.reportPresence(auth, hasFocus, newUserInput);
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

  const now = new Date();
  if (differenceInSeconds(now, lastTypingStart) > 15) {
    const auth = getAuth(getState());
    api.typing(auth, narrow[0].operand, 'start');
    lastTypingStart = now;
  }
};
