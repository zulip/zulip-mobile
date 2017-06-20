/* @flow */
import { GlobalState } from '../types';
import { isHomeNarrow, isMessageInNarrow } from '../utils/narrow';
import { getActiveAccount, getSelfEmail } from '../account/accountSelectors';
import { playMessageSound } from '../utils/sound';

export default (state: GlobalState, event: Object) => {
  switch (event.type) {
    case 'message': {
      const isPrivateMessage = Array.isArray(event.message.display_recipient);
      if (!isPrivateMessage && !event.message.is_mentioned) {
        break;
      }

      const activeAccount = getActiveAccount(state);
      const isUserInSameNarrow = !isHomeNarrow(state.chat.narrow) &&
        activeAccount && isMessageInNarrow(event.message, state.chat.narrow, activeAccount.email);
      const isSenderSelf = getSelfEmail(state) === event.message.sender_email;
      if (!isUserInSameNarrow && !isSenderSelf) {
        playMessageSound();
      }

      break;
    }
    default:
  }
};
