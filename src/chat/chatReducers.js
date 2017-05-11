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
} from '../actionConstants';
import { homeNarrow, isMessageInNarrow } from '../utils/narrow';
import chatUpdater from './chatUpdater';

const initialState = {
  fetching: { older: true, newer: true },
  caughtUp: { older: false, newer: false },
  narrow: homeNarrow(),
  messages: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_START:
      return {
        ...state,
        narrow: action.narrow,
        fetching: { ...state.fetching, ...action.fetching },
        caughtUp: { ...state.caughtUp, ...action.caughtUp },
      };

    case SWITCH_NARROW: {
      return {
        ...state,
        narrow: action.narrow,
        fetching: { older: false, newer: false },
        caughtUp: { older: false, newer: false },
      };
    }

    case MESSAGE_FETCH_SUCCESS: {
      const key = JSON.stringify(action.narrow);
      const prevMessages = state.messages[key] || [];

      const newMessages = action.replacePrevious
        ? action.messages
        : action.messages
            .filter(x => !prevMessages.find(msg => msg.id === x.id))
            .concat(prevMessages)
            .sort((a, b) => a.timestamp - b.timestamp);

      return {
        ...state,
        messages: {
          ...state.messages,
          [key]: newMessages,
        },
        fetching: { ...state.fetching, ...action.fetching },
        caughtUp: { ...state.caughtUp, ...action.caughtUp },
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
        reactions: oldMessage.reactions.filter(x =>
          !(x.emoji_name === action.emoji &&
          x.user.email === action.user.email)
        ),
      }));

    case EVENT_NEW_MESSAGE: {
      return {
        ...state,
        messages: Object.keys(state.messages).reduce((msg, key) => {
          const isInNarrow = isMessageInNarrow(action.message, JSON.parse(key), action.selfEmail);
          msg[key] = isInNarrow ?
          [
            ...state.messages[key],
            action.message,
          ] :
          state.messages[key];

          return msg;
        }, {}),
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
