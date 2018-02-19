/* @flow */
import type { Dispatch, GetState } from '../types';

import { getTyping } from '../directSelectors';

export const clearTypingNotification = () => async (dispatch: Dispatch, getState: GetState) => {
  // loop to auto dismiss typing notifications after typingNotificationTimeout
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 15000));
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
    // clear typing notifications
    const action = {
      type: 'CLEAR_TYPING_NOTIFICATIONS',
      outdatedNotifications,
    };
    dispatch(action);
  }
};
