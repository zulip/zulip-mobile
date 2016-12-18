import { getMessages } from '../message-list/messagesSelectors';

export const getPointer = (state) => {
  const messages = getMessages(state);

  if (messages.length === 0) {
    return [0, 0];
  }

  return [messages[0].id, messages[messages.length - 1].id];
};
