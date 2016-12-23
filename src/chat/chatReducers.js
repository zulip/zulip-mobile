import {
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE,
} from '../constants';

const initialState = {
  fetching: false,
  caughtUp: false,
  narrow: [],
  messages: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case MESSAGE_FETCH_START:
      return {
        ...state,
        fetching: true,
        narrow: action.narrow
      };

    case MESSAGE_FETCH_SUCCESS: {
      const key = JSON.stringify(state.narrow);
      const messages = state.messages[key] || [];
      const newMessages = action.messages
        .filter(x => !messages.find(msg => msg.id === x.id))
        .concat(messages)
        .sort((a, b) => a.timestamp - b.timestamp);

      return {
        fetching: false,
        narrow: action.narrow,
        caughtUp: action.caughtUp,
        messages: {
          ...state.messages,
          [key]: newMessages,
        }
      };
    }

    case EVENT_NEW_MESSAGE: {
      const key = JSON.stringify(action.narrow);

      return {
        fetching: state.fetching,
        narrow: state.narrow,
        caughtUp: state.caughtUp,
        messages: {
          ...state.messages,
          '[]': [
            ...state.messages['[]'],
            action.message,
          ],
          [key]: [
            ...state.messages[key] || [],
            action.message,
          ],
        },
      };
    }

    case EVENT_UPDATE_MESSAGE: {
      const key = JSON.stringify(state.narrow);
      const messages = state.messages[key] || [];
      const prevMessageIndex = messages.findIndex(x => x.id === action.messageId);

      if (prevMessageIndex === -1) return state;

      return {
        fetching: state.fetching,
        narrow: state.narrow,
        caughtUp: state.caughtUp,
        messages: {
          [key]: [
            ...messages.slice(0, prevMessageIndex),
            {
              ...messages[prevMessageIndex],
              content: action.newContent,
              edit_timestamp: action.editTimestamp,
            },
            ...messages.slice(prevMessageIndex + 1),
          ],
        }
      };
    }

    default:
      return state;
  }
};
