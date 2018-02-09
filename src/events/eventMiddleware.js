/* @flow */
// import { Vibration } from 'react-native';

import type { GlobalState } from '../types';
import { isHomeNarrow, isMessageInNarrow } from '../utils/narrow';
import { getActiveAccount, getActiveNarrow, getOwnEmail } from '../selectors';
import { playMessageSound } from '../utils/sound';

export default (state: GlobalState, event: Object) => {
  switch (event.type) {
    case 'message': {
      const isPrivateMessage = Array.isArray(event.message.display_recipient);
      if (!isPrivateMessage && !event.message.is_mentioned) {
        break;
      }

      const activeAccount = getActiveAccount(state);
      const narrow = getActiveNarrow(state);
      const isUserInSameNarrow =
        !isHomeNarrow(narrow) &&
        activeAccount &&
        isMessageInNarrow(event.message, narrow, activeAccount.email);
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
