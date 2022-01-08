/* @flow strict-local */
import type { PerAccountAction, ThunkAction } from '../types';

import { sleep } from '../utils/async';
import { getTyping } from '../directSelectors';

export const clearTyping = (outdatedNotifications: $ReadOnlyArray<string>): PerAccountAction => ({
  type: 'CLEAR_TYPING',
  outdatedNotifications,
});

const typingStatusExpiryLoop = () => async (dispatch, getState) => {
  // loop to auto dismiss typing notifications after typingNotificationTimeout
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(15000);
    const currentTime = new Date().getTime();
    const typing = getTyping(getState());
    if (Object.keys(typing).length === 0) {
      break; // break if no typing notifications
    }
    const outdatedNotifications = [];
    Object.keys(typing).forEach(recipients => {
      if (currentTime - typing[recipients].time >= 15000) {
        outdatedNotifications.push(recipients);
      }
    });
    dispatch(clearTyping(outdatedNotifications));
  }
};

/** Start the typing-status expiry loop, if there isn't one already. */
export const ensureTypingStatusExpiryLoop = (): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const state = getState();
  if (Object.keys(state.typing).length === 0) {
    dispatch(typingStatusExpiryLoop());
  }
};
