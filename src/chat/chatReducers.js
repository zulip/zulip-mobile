import {
  STREAM_FETCHING_MESSAGES,
  STREAM_FETCHED_MESSAGES,
  STREAM_SET_MESSAGES,
} from '../constants';

const initialState = {
  fetching: false,
  caughtUp: false,
  narrow: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case STREAM_FETCHING_MESSAGES:
      return {
        ...state,
        fetching: true,
      };
    case STREAM_FETCHED_MESSAGES: {
      return {
        ...state,
        fetching: false,
        narrow: action.narrow,
        caughtUp: action.caughtUp,
      };
    }

    case STREAM_SET_MESSAGES: {
      return {
        ...state,
        fetching: action.fetching,
        caughtUp: action.caughtUp,
      };
    }
    default:
      return state;
  }
};
