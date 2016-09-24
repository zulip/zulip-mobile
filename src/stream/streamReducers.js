import Immutable from 'immutable';

import {
  STREAM_FETCHING_MESSAGES,
  STREAM_FETCHED_MESSAGES,
  STREAM_FETCHING_FAILED,
} from './streamActions';

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
    default:
      return state;
  }
};

export default reducer;
