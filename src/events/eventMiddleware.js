/* @flow strict-local */
// import { Vibration } from 'react-native';

import type { GeneralEvent, GlobalState, MessageEvent } from '../types';
import { isHomeNarrow, isMessageInNarrow } from '../utils/narrow';
import { getActiveAccount, getChatScreenParams, getOwnEmail, getIsActive } from '../selectors';
import { playMessageSound } from '../utils/sound';
import { NULL_ARRAY } from '../nullObjects';

export default (state: GlobalState, event_: GeneralEvent) => {
  switch (event_.type) {
    case 'message': {
      // $FlowFixMe This expresses our unchecked assumptions about `message` events.
      const event = (event_: MessageEvent);

      // Move `flags` key from `event` to `event.message` for consistency, and
      // default to an empty array if `event.flags` is not set.
      const flags = event.message.flags ?? event.flags ?? NULL_ARRAY;
      if (!event.message.flags) {
        // $FlowFixMe: Message is readonly to serve our use of it in Redux.
        event.message.flags = flags;
        delete event.flags;
      }

      const isActive = getIsActive(state);
      const isPrivateMessage = Array.isArray(event.message.display_recipient);

      const isMentioned = flags.includes('mentioned') || flags.includes('wildcard_mentioned');
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
