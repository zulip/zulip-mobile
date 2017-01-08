import {
  ACCOUNT_SWITCH,
  SWITCH_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
  EVENT_NEW_MESSAGE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
} from '../constants';
import { isMessageInNarrow } from '../utils/narrow';
import chatUpdater from './chatUpdater';

const getInitialState = () => ({
  /*
  `fetching` and `caughtUp` are tuples representing (top, bottom) respectively.

  `fetching` is true if we're in the process of fetching data in that direction.
  `caughtUp` is true if we know that we're at the last message in that direction.
  */
  fetching: [false, false],
  caughtUp: [false, false],
  narrow: [],
  messages: {},
});

export default (state = getInitialState(), action) => {
  switch (action.type) {
    case ACCOUNT_SWITCH:
      return getInitialState();

    case SWITCH_NARROW:
      return {
        ...state,
        narrow: action.narrow,
        fetching: action.fetching,
        caughtUp: [false, false],
      };

    case MESSAGE_FETCH_START:
      return {
        ...state,
        narrow: action.narrow,
        fetching: [
          action.fetching[0] || state.fetching[0],
          action.fetching[1] || state.fetching[1],
        ],
        caughtUp: action.caughtUp ? action.caughtUp : state.caughtUp,
      };

    case MESSAGE_FETCH_SUCCESS: {
      const key = JSON.stringify(action.narrow);
      const messages = state.messages[key] || [];
      const newMessages = action.messages
        .filter(x => !messages.find(msg => msg.id === x.id))
        .concat(messages)
        .sort((a, b) => a.timestamp - b.timestamp);

      return {
        ...state,
        fetching: [
          action.fetching[0] && state.fetching[0],
          action.fetching[1] && state.fetching[1],
        ],
        messages: {
          ...state.messages,
          [key]: newMessages,
        },
        caughtUp: [
          action.caughtUp[0] || state.caughtUp[0],
          action.caughtUp[1] || state.caughtUp[1],
        ],
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
          msg[key] = isInNarrow ? // eslint-disable-line
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
