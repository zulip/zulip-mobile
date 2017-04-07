export default (state, messageId, updater) => ({
  ...state,
  messages: Object.keys(state.messages).reduce(
    (msg, key) => {
      const messages = state.messages[key];
      const prevMessageIndex = messages.findIndex(x => x.id === messageId);

      msg[key] = prevMessageIndex !== -1 // eslint-disable-line
        ? [
            ...messages.slice(0, prevMessageIndex),
            updater(messages[prevMessageIndex]),
            ...messages.slice(prevMessageIndex + 1),
          ]
        : state.messages[key];

      return msg;
    },
    {}
  ),
});
