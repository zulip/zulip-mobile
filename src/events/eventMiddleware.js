/* @flow */
// import { Vibration } from 'react-native';

import type { GlobalState } from '../types';
import { isHomeNarrow, isMessageInNarrow } from '../utils/narrow';
import { getActiveAccount, getChatScreenParams, getOwnEmail, getIsActive } from '../selectors';
import { playMessageSound } from '../utils/sound';

export default (state: GlobalState, event: Object) => {
  switch (event.type) {
    case 'message': {
      // move `flags` key from `event` to `event.message` for consistency
      if (event.flags && !event.message.flags) {
        event.message.flags = event.flags;
        delete event.flags;
      }

      const isActive = getIsActive(state);
      const isPrivateMessage = Array.isArray(event.message.display_recipient);
      const isMentioned = event.message.flags && event.message.flags.includes('mentioned');
      if (!isActive || !(isPrivateMessage || isMentioned)) {
        break;
      }

      const activeAccount = getActiveAccount(state);
      const { narrow } = getChatScreenParams(state);
      const isUserInSameNarrow =
        activeAccount
        && (narrow !== undefined // chat screen is not at top
          && (!isHomeNarrow(narrow) && isMessageInNarrow(event.message, narrow, activeAccount.email)));
      const isSenderSelf = getOwnEmail(state) === event.message.sender_email;
      if (!isUserInSameNarrow && !isSenderSelf) {
        playMessageSound();
        // Vibration.vibrate();
      }

      break;
    }
    default:
  }
};
