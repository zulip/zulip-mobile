import {
  CHAT_FETCHING_MESSAGES,
  CHAT_FETCHED_MESSAGES,
} from '../constants';

const initialState = {
  fetching: false,
  caughtUp: false,
  narrow: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CHAT_FETCHING_MESSAGES:
      return {
        ...state,
        fetching: true,
      };
    case CHAT_FETCHED_MESSAGES:
      return {
        ...state,
        fetching: false,
        narrow: action.narrow,
        caughtUp: action.caughtUp,
      };
    default:
      return state;
  }
};
