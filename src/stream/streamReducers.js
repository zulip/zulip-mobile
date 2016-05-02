import {
  STREAM_FETCHING_MESSAGES,
  STREAM_NEW_MESSAGES,
  STREAM_FETCHING_FAILED,
} from './streamActions';

import Immutable from 'immutable';

// Initial state
const initialState = {
  messages: [],
  fetching: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case STREAM_FETCHING_MESSAGES:
      return {
        ...state,
        fetching: true,
      };
    case STREAM_NEW_MESSAGES:
      /**
       * We've received new messages and need to combine them with our
       * existing messages
       */
      return {
        messages: new Immutable.List(action.messages),
        fetching: false,
      };
    case STREAM_FETCHING_FAILED:
      return {
        messages: [],
        fetching: false,
      };
    default:
      return state;
  }
};

export default reducer;
