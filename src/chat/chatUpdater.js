/* @flow */
import type { GlobalState, Message } from '../types';

type UpdaterFunc = (message: Message) => Message[];

export default (state: GlobalState, messageId: number, updater: UpdaterFunc): GlobalState => ({
  ...state,
  messages: Object.keys(state.messages).reduce((msg, key) => {
    const messages = state.messages[key];
    const prevMessageIndex = messages.findIndex(x => x.id === messageId);

    msg[key] =
      prevMessageIndex !== -1
        ? [
            ...messages.slice(0, prevMessageIndex),
            updater(messages[prevMessageIndex]),
            ...messages.slice(prevMessageIndex + 1),
          ]
        : state.messages[key];

    return msg;
  }, {}),
});
