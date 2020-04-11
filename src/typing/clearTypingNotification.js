/* @flow strict-local */
import type { Dispatch, GetState } from '../types';

import { sleep } from '../utils/async';
import { clearTyping } from './typingActions';
import { getTyping } from '../directSelectors';

export const clearTypingNotification = () => async (dispatch: Dispatch, getState: GetState) => {
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
