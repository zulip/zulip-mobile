import Immutable from 'immutable';

import {
  OPEN_STREAM_SIDEBAR,
  CLOSE_STREAM_SIDEBAR,
} from '../nav/navActions';

import {
  STREAM_SET_MESSAGES,
} from '../stream/streamActions';

// Initial state
const initialState = {
  opened: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_STREAM_SIDEBAR:
      return {
        ...state,
        opened: true
      };
    case CLOSE_STREAM_SIDEBAR:
      return {
        ...state,
        opened: false
      };
    case STREAM_SET_MESSAGES:
      return {
        ...state,
        opened: false,
      };
    default:
      return state;
  }
};

export default reducer;
