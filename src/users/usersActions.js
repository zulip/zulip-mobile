/* @flow strict-local */
import differenceInSeconds from 'date-fns/difference_in_seconds';
import * as typing_status from '@zulip/shared/js/typing_status';

import type { Dispatch, GetState, Narrow } from '../types';
import * as api from '../api';
import { PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth, tryGetAuth } from '../selectors';
import { isPrivateOrGroupNarrow, caseNarrowPartial } from '../utils/narrow';
import { getAllUsersByEmail } from './userSelectors';

let lastReportPresence = new Date(0);

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

const typingWorkerBase = auth => ({
  get_current_time: () => new Date().getTime(),

  notify_server_start: (user_ids_array: number[]) => {
    api.typing(auth, JSON.stringify(user_ids_array), 'start');
  },

  notify_server_stop: (user_ids_array: number[]) => {
    api.typing(auth, JSON.stringify(user_ids_array), 'stop');
  },
});

/**
 * Tell the server the user is, is still, or is no longer typing, as needed.
 *
 * This can and should be called frequently, on each keystroke.  The
 * implementation sends "still typing" notices at an appropriate throttled
 * rate, and keeps a timer to send a "stopped typing" notice when the user
 * hasn't typed for a few seconds.
 *
 * Zulip supports typing notifications only for PMs (both 1:1 and group); so
 * composing a stream message should be treated here like composing no
 * message at all.
 *
 * Call with `recipientIds` of `null` when the user actively stops composing
 * a message.  If the user switches from one set of recipients to another,
 * there's no need to call with `null` in between; the implementation tracks
 * the change and behaves appropriately.
 *
 * @param recipientIds The users the message being composed is addressed to;
 *   `null` if no message is being composed anymore.
 */
const maybeNotifyTyping = (auth, recipientIds: number[] | null) => {
  // We rely on a few facts about the implementation of typing_status.
  // TODO refactor its API to something that reflects the needed facts
  //   directly... e.g. one closer to this function's interface.
  //
  // Fact: get_recipient has just one call site, at the top of
  // handle_text_input.  Effectively its *return value* behaves as a
  // parameter to handle_text_input.
  //
  // Fact: is_valid_conversation also has just one call site, also in
  // handle_text_input.  Barring a pathological notify_server_stop, it might
  // as well be at the function's top.  So effectively its return value also
  // behaves as a parameter to handle_text_input.
  //
  // So for both get_recipient and is_valid_conversation, we always just
  // pass constant functions that return our intended values for those
  // logical "parameters".
  if (!recipientIds) {
    // A fun fact we don't directly rely on: calling `handle_text_input`
    // with these arguments would have exactly the same effect as `stop`.
    typing_status.stop({
      ...typingWorkerBase(auth),
      // (These two aren't actually consulted by `stop`.)
      get_recipient: () => undefined,
      is_valid_conversation: () => false,
    });
  } else {
    typing_status.handle_text_input({
      ...typingWorkerBase(auth),
      get_recipient: () => recipientIds,

      // The `is_valid_conversation` implementation in the webapp has a few
      // wrinkles we don't see a need to include.
      is_valid_conversation: () => true,
    });
  }
};

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
  maybeNotifyTyping(auth, recipientIds);
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
  maybeNotifyTyping(auth, null);
};
