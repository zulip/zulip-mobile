import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
} from '../constants';
import {isMessageInNarrow} from '../utils/narrow';
import chatUpdater from './chatUpdater';

const getInitialState = () => ({
  fetching: {older: false, newer: false},
  caughtUp: {older: false, newer: false},
  narrow: [],
  messages: {},
});

export default (state = getInitialState(), action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return getInitialState();

    case MESSAGE_FETCH_START:
      return {
        ...state,
        narrow: action.narrow,
        fetching: {...state.fetching, ...action.fetching},
        caughtUp: {...state.caughtUp, ...action.caughtUp},
      };

    case SWITCH_NARROW: {
      const key = JSON.stringify(action.narrow);
      return {
        ...state,
        narrow: action.narrow,
        messages: {
          ...state.messages,
          [key]: action.messages,
        },
        fetching: {older: false, newer: false},
        caughtUp: {older: false, newer: false},
      };
    }

    case MESSAGE_FETCH_SUCCESS: {
      const key = JSON.stringify(action.narrow);
      const messages = state.messages[key] || [];

      // TODO: this is O(n^2) in the number of messages
      // Since these are both sorted we can do this in O(n) time
      const newMessages = action.messages
        .filter(x => !messages.find(msg => msg.id === x.id))
        .concat(messages)
        .sort((a, b) => a.timestamp - b.timestamp);

      return {
        ...state,
        messages: {
          ...state.messages,
          [key]: newMessages,
        },
        fetching: {...state.fetching, ...action.fetching},
        caughtUp: {...state.caughtUp, ...action.caughtUp},
      };
    }

    case EVENT_REACTION_ADD:
      return chatUpdater(state, action.messageId, oldMessage => ({
        ...oldMessage,
        reactions: oldMessage.reactions.concat({
          emoji_name: action.emoji,
          user: action.user,
        }),
      }));

    case EVENT_REACTION_REMOVE:
      return chatUpdater(state, action.messageId, oldMessage => ({
        ...oldMessage,
        reactions: oldMessage.reactions.filter(
          x =>
            !(x.emoji_name === action.emoji &&
              x.user.email === action.user.email)
        ),
      }));

    case EVENT_NEW_MESSAGE: {
      return {
        ...state,
        messages: Object.keys(state.messages).reduce(
          (msg, key) => {
            const isInNarrow = isMessageInNarrow(
              action.message,
              JSON.parse(key),
              action.selfEmail
            );
            msg[key] = isInNarrow // eslint-disable-line
              ? [...state.messages[key], action.message]
              : state.messages[key];

            return msg;
          },
          {}
        ),
      };
    }

    case EVENT_UPDATE_MESSAGE:
      return chatUpdater(state, action.messageId, oldMessage => ({
        ...oldMessage,
        content: action.newContent,
        edit_timestamp: action.editTimestamp,
      }));
    default:
      return state;
  }
};
