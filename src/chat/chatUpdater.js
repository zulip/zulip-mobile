/* @flow */
import type { MessagesState, Message } from '../types';

type UpdaterFunc = (message: Message) => ?Message;

export default (state: MessagesState, messageId: number, updater: UpdaterFunc): MessagesState => {
  const allMessages = Object.keys(state).reduce((msg, key) => msg.concat(state[key]), []);
  if (allMessages.findIndex(x => x.id === messageId) === -1) {
    return state;
  }

  return Object.keys(state).reduce((msg, key) => {
    const messages = state[key];
    const prevMessageIndex = messages.findIndex(x => x.id === messageId);

    if (prevMessageIndex === -1) {
      msg[key] = state[key];
      return msg;
    }

    const newMessage = updater(messages[prevMessageIndex]);

    if (newMessage) {
      msg[key] = [
        ...messages.slice(0, prevMessageIndex),
        newMessage,
        ...messages.slice(prevMessageIndex + 1),
      ];
      return msg;
    }
    // message subject is edited
    // delete message from this bucket
    msg[key] = [...state[key]];
    msg[key].splice(prevMessageIndex, 1);
    return msg;
  }, {});
};
