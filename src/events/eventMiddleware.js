import { isHomeNarrow, isMessageInNarrow } from '../utils/narrow';
import { getActiveAccount } from '../account/accountSelectors';
import { playMessageSound } from '../utils/sound';

export default (state, event) => {
  switch (event.type) {
    case 'message': {
      const isPrivateMessage = Array.isArray(event.message.display_recipient);
      if (!isPrivateMessage && !event.message.is_mentioned) {
        break;
      }

      const isUserInSameNarrow = !isHomeNarrow(state.chat.narrow) &&
        isMessageInNarrow(event.message, state.chat.narrow, getActiveAccount(state).email);
      if (!isUserInSameNarrow) {
        playMessageSound();
      }

      break;
    }
    default:
  }
};
