/* @flow */
import type { MessagesState, Message } from '../types';

type UpdaterFunc = (message: Message) => Message;

export default (state: MessagesState, messageId: number, updater: UpdaterFunc): MessagesState => {
  const allMessages = Object.keys(state).reduce((msg, key) => msg.concat(state[key]), []);
  if (allMessages.findIndex(x => x.id === messageId) === -1) {
    return state;
  }

  return Object.keys(state).reduce((msg, key) => {
    const messages = state[key];
    const prevMessageIndex = messages.findIndex(x => x.id === messageId);

    msg[key] =
      prevMessageIndex !== -1
        ? [
            ...messages.slice(0, prevMessageIndex),
            updater(messages[prevMessageIndex]),
            ...messages.slice(prevMessageIndex + 1),
          ]
        : state[key];

    return msg;
  }, {});
};
