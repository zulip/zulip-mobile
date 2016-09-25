import Immutable from 'immutable';

import {
  STREAM_FETCHING_MESSAGES,
  STREAM_FETCHED_MESSAGES,
  STREAM_FETCHING_FAILED,
  STREAM_SET_MESSAGES,
} from './streamActions';

import {
  EVENT_NEW_MESSAGE,
} from '../events/eventActions';

// Initial state
const initialState = {
  messages: new Immutable.List(),
  fetching: false,
  pointer: [0, 0],
  caughtUp: false,
  narrow: {},
};

function mergeMessages(state, action, appendNewMessages=false) {
  if (appendNewMessages) {
    return state.messages.filter((v) =>
      v.id !== action.anchor
    ).concat(action.messages);
  }
  return state.messages.filter((v) =>
    v.id !== action.anchor
  ).unshift(...action.messages);
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case STREAM_FETCHING_MESSAGES:
      return {
        ...state,
        fetching: true,
      };
    case STREAM_FETCHING_FAILED:
      return {
        ...state,
        fetching: false,
      };
    case STREAM_FETCHED_MESSAGES:
    {
      /**
       * We've received messages and need to combine them with our
       * existing messages
       */
      const messages = mergeMessages(state, action, action.shouldAppend);
      return {
        ...state,
        messages: messages,
        pointer: [messages.first().id, messages.last().id],
        fetching: false,
        narrow: action.narrow,
        caughtUp: action.caughtUp,
      };
    }

    case STREAM_SET_MESSAGES:
    {
      const messages = new Immutable.List(action.messages);
      let pointer = [0, 0];
      if (action.messages.length) {
        pointer = [messages.first().id, messages.last().id];
      }
      return {
        ...state,
        messages: messages,
        pointer: pointer,
        fetching: action.fetching,
        caughtUp: action.caughtUp,
      };
    }

    case EVENT_NEW_MESSAGE:
      // TODO: fix this logic, it's really hacky
      return {
        ...state,
        messages: state.messages.push(action.message),
        pointer: [state.pointer[0], action.message.id],
      };
    default:
      return state;
  }
};

export default reducer;
