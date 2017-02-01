export const getAllMessages = (state) =>
  state.chat.messages;

export const getMessagesInActiveNarrow = (state) =>
  state.chat.messages[JSON.stringify(state.chat.narrow)] || [];

export const getPointer = (state) => {
  const messages = getMessagesInActiveNarrow(state);

  if (messages.length === 0) {
    return {
      older: Number.MAX_SAFE_INTEGER,
      newer: Number.MAX_SAFE_INTEGER,
    };
  }

  return {
    older: messages[0].id,
    newer: messages[messages.length - 1].id,
  };
};
