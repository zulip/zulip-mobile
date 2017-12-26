/* @flow */
import type { GlobalState, Message } from '../types';

type UpdaterFunc = (message: Message) => Message[];

export default (state: GlobalState, action: Object, updater: UpdaterFunc): GlobalState => {
  const allMessages = Object.keys(state.messages).reduce(
    (msg, key) => msg.concat(state.messages[key]),
    [],
  );
  if (allMessages.findIndex(x => x.id === action.message_id) === -1) {
    return state;
  }

  let newWebViewState = state.webView;
  if (
    state.messages[JSON.stringify(state.narrow)].findIndex(x => x.id === action.message_id) !== -1
  ) {
    newWebViewState = {
      ...state.webView,
      updateMessages: [...state.webView.updateMessages, { id: Date.now(), action }],
    };
  }

  return {
    ...state,
    webView: newWebViewState,
    messages: Object.keys(state.messages).reduce((msg, key) => {
      const messages = state.messages[key];
      const prevMessageIndex = messages.findIndex(x => x.id === action.message_id);

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
  };
};
