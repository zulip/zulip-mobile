/* @flow */
import type { GlobalState, Message } from '../types';
import { NULL_MESSAGE_INDEX } from '../nullObjects';

type UpdaterFunc = (message: Message) => Message[];

export default (state: GlobalState, messageId: number, updater: UpdaterFunc): GlobalState => ({
  ...state,
  messages: Object.keys(state.messages).reduce((msg, key) => {
    const messages = state.messages[key];
    const prevMessageIndex = messages.findIndex(x => x.id === messageId);

    msg[key] = prevMessageIndex !== NULL_MESSAGE_INDEX ?
    [
      ...messages.slice(0, prevMessageIndex),
      updater(messages[prevMessageIndex]),
      ...messages.slice(prevMessageIndex + 1),
    ] :
    state.messages[key];

    return msg;
  }, {}),
});
