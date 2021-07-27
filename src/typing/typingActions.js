/* @flow strict-local */
import type { Action, ThunkAction, Dispatch, GetState } from '../types';

import { sleep } from '../utils/async';
import { getTyping } from '../directSelectors';

export const clearTyping = (outdatedNotifications: string[]): Action => ({
  type: 'CLEAR_TYPING',
  outdatedNotifications,
});

const typingStatusExpiryLoop = () => async (dispatch: Dispatch, getState: GetState) => {
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
