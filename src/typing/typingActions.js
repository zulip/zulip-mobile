/* @flow strict-local */
import type { PerAccountAction, ThunkAction } from '../types';

import { sleep } from '../utils/async';
import { getTyping } from '../directSelectors';

/**
 * The value to use for `server_typing_started_expiry_period_milliseconds`.
 *
 * The corresponding old server setting was `TYPING_STARTED_EXPIRY_PERIOD`.
 *
 * The specified behavior is that we should be taking this value from server
 * data.  See docs:
 *   https://chat.zulip.org/api/set-typing-status
 *
 * But in this legacy codebase, the most expedient thing is to hardcode it
 * to a large value.  We'll get proper user-facing behavior as long as this
 * value exceeds by at least a network round-trip the effective value of
 * `server_typing_started_wait_period_milliseconds` in the behavior of other
 * clients.  Discussion:
 *   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/typing.20notifications.20constants/near/1665193
 */
const typingStartedExpiryPeriodMs = 45000;

/**
 * The period at which to poll for expired typing notifications.
 *
 * Really no polling should be needed here -- a timer would be better.
 * But that's how this code has always worked, and for this legacy codebase
 * that'll do.
 */
const typingPollPeriodMs = 3000;

export const clearTyping = (outdatedNotifications: $ReadOnlyArray<string>): PerAccountAction => ({
  type: 'CLEAR_TYPING',
  outdatedNotifications,
});

const typingStatusExpiryLoop = () => async (dispatch, getState) => {
  // loop to auto dismiss typing notifications after typingNotificationTimeout
  while (true) {
    await sleep(typingPollPeriodMs);
    const currentTime = new Date().getTime();
    const typing = getTyping(getState());
    if (Object.keys(typing).length === 0) {
      break; // break if no typing notifications
    }
    const outdatedNotifications = [];
    Object.keys(typing).forEach(recipients => {
      if (currentTime - typing[recipients].time >= typingStartedExpiryPeriodMs) {
        outdatedNotifications.push(recipients);
      }
    });
    dispatch(clearTyping(outdatedNotifications));
  }
};

/** Start the typing-status expiry loop, if there isn't one already. */
export const ensureTypingStatusExpiryLoop =
  (): ThunkAction<Promise<void>> => async (dispatch, getState) => {
    const state = getState();
    if (Object.keys(state.typing).length === 0) {
      dispatch(typingStatusExpiryLoop());
    }
  };
