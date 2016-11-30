import {
  CHAT_FETCHED_MESSAGES,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case EVENT_NEW_MESSAGE:
      return [
        ...state,
        action.message
      ];
    case EVENT_UPDATE_MESSAGE: {
      const prevMessageIndex = state.findIndex(x => x.id === action.messageId);

      if (prevMessageIndex === -1) return state;

      return [
        ...state.slice(0, prevMessageIndex),
        {
          ...state[prevMessageIndex],
          content: action.newContent,
          edit_timestamp: action.editTimestamp,
        },
        ...state.slice(prevMessageIndex + 1),
      ];
    }
    case CHAT_FETCHED_MESSAGES: {
      const newMessages = action.messages
        .filter(x => !state.find(msg => msg.id === x.id));

      return state
        .concat(newMessages)
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    default:
      return state;
  }
};
