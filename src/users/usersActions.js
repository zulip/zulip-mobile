/* @flow strict-local */
import * as typing_status from '@zulip/shared/js/typing_status';

import type { Dispatch, GetState, Narrow } from '../types';
import * as api from '../api';
import { PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth, tryGetAuth } from '../selectors';
import { isPrivateOrGroupNarrow, caseNarrowPartial } from '../utils/narrow';
import { getAllUsersByEmail } from './userSelectors';

export const reportPresence = (isActive: boolean = true, newUserInput: boolean = false) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = tryGetAuth(getState());
  if (!auth) {
    return; // not logged in
  }

  const response = await api.reportPresence(auth, isActive, newUserInput);
  dispatch({
    type: PRESENCE_RESPONSE,
    presence: response.presences,
    serverTimestamp: response.server_timestamp,
  });
};

const typingWorker = auth => ({
  get_current_time: () => new Date().getTime(),

  notify_server_start: (user_ids_array: number[]) => {
    api.typing(auth, JSON.stringify(user_ids_array), 'start');
  },

  notify_server_stop: (user_ids_array: number[]) => {
    api.typing(auth, JSON.stringify(user_ids_array), 'stop');
  },
});

export const sendTypingStart = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (!isPrivateOrGroupNarrow(narrow)) {
    return;
  }

  const usersByEmail = getAllUsersByEmail(getState());
  const recipientIds = caseNarrowPartial(narrow, {
    pm: email => [email],
    groupPm: emails => emails,
  }).map(email => {
    const user = usersByEmail.get(email);
    if (!user) {
      throw new Error('unknown user');
    }
    return user.user_id;
  });

  const auth = getAuth(getState());
  typing_status.update(typingWorker(auth), recipientIds);
};

// TODO call this on more than send: blur, navigate away,
//   delete all contents, etc.
export const sendTypingStop = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  if (!isPrivateOrGroupNarrow(narrow)) {
    return;
  }

  const auth = getAuth(getState());
  typing_status.update(typingWorker(auth), null);
};
