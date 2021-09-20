/* @flow strict-local */
import * as typing_status from '@zulip/shared/js/typing_status';

import type { Auth, GlobalState, Narrow, UserId, ThunkAction } from '../types';
import * as api from '../api';
import { PRESENCE_RESPONSE } from '../actionConstants';
import { getAuth, getServerVersion } from '../selectors';
import { isPmNarrow, userIdsOfPmNarrow } from '../utils/narrow';
import { getUserForId } from './userSelectors';
import { ZulipVersion } from '../utils/zulipVersion';

export const reportPresence = (isActive: boolean): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const newUserInput = false; // TODO Why this value?  Maybe it's the right one... but why?

  const auth = getAuth(getState());
  const response = await api.reportPresence(auth, isActive, newUserInput);
  dispatch({
    type: PRESENCE_RESPONSE,
    presence: response.presences,
    serverTimestamp: response.server_timestamp,
  });
};

// Callbacks for the typing_status module, all bound to this account.
// NB the callbacks may be invoked later, on timers.  They should continue
// to refer to this account regardless of what the then-active account might be.
const typingWorker = (state: GlobalState) => {
  const auth: Auth = getAuth(state);
  const serverVersion: ZulipVersion | null = getServerVersion(state);

  // User ID arrays are only supported in server versions >= 2.0.0-rc1
  // (zulip/zulip@2f634f8c0). For versions before this, email arrays
  // are used. If current server version is undetermined, user ID
  // arrays are optimistically used.
  const useEmailArrays = !!serverVersion && !serverVersion.isAtLeast('2.0.0-rc1');

  const getRecipients = user_ids_array => {
    if (useEmailArrays) {
      return JSON.stringify(user_ids_array.map(userId => getUserForId(state, userId).email));
    }
    return JSON.stringify(user_ids_array);
  };

  return {
    get_current_time: () => new Date().getTime(),

    notify_server_start: (user_ids_array: $ReadOnlyArray<UserId>) => {
      api.typing(auth, getRecipients(user_ids_array), 'start');
    },

    notify_server_stop: (user_ids_array: $ReadOnlyArray<UserId>) => {
      api.typing(auth, getRecipients(user_ids_array), 'stop');
    },
  };
};

export const sendTypingStart = (narrow: Narrow): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  if (!isPmNarrow(narrow)) {
    return;
  }

  const recipientIds = userIdsOfPmNarrow(narrow);
  // TODO(#5005): The shared typing_status doesn't behave right on switching
  //   accounts; it mingles state from the last call with data from this one.
  //   E.g., `update` calls stop_last_notification with this worker, so the
  //   new notify_server_stop, not with the old.  Also if user IDs happen to
  //   match when server changed, it won't notice change.
  //
  //   To fix, state should live in an object we can keep around per-account,
  //   instead of as module global.
  //
  //   (This is pretty low-impact, because these are inherently ephemeral.)
  typing_status.update(typingWorker(getState()), recipientIds);
};

// TODO call this on more than send: blur, navigate away,
//   delete all contents, etc.
export const sendTypingStop = (narrow: Narrow): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  if (!isPmNarrow(narrow)) {
    return;
  }

  // TODO(#5005): Same as in sendTypingStart, above.
  typing_status.update(typingWorker(getState()), null);
};
