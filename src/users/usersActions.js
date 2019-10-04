/* @flow strict-local */
import differenceInSeconds from 'date-fns/difference_in_seconds';
import * as typing_status from '@zulip/shared/js/typing_status';

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
    // TODO throttle properly; probably fold setInterval logic in here
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

export const sendTypingStart = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (!isPrivateOrGroupNarrow(narrow)) {
    return;
  }

  const nopWorker = {
    get_recipient: () => undefined,
    is_valid_conversation: () => true,
    get_current_time: () => new Date().getTime(),
    notify_server_start: () => {},
    notify_server_stop: () => {},
  };
  typing_status.handle_text_input(nopWorker);

  const now = new Date();
  if (differenceInSeconds(now, lastTypingStart) < 15) {
    // TODO throttle properly -- e.g. if typing furiously for 14s,
    //      don't treat as if just typed briefly at start
    return;
  }
  lastTypingStart = now;

  const auth = getAuth(getState());
  api.typing(auth, narrow[0].operand, 'start');
};

export const sendTypingStop = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (!isPrivateOrGroupNarrow(narrow)) {
    return;
  }

  const auth = getAuth(getState());
  api.typing(auth, narrow[0].operand, 'stop');
  lastTypingStart = new Date(0);
};
