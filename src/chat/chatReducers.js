import {
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
} from '../constants';

const initialState = {
  fetching: false,
  caughtUp: false,
  narrow: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case MESSAGE_FETCH_START:
      return {
        ...state,
        fetching: true,
        narrow: action.narrow,
      };
    case MESSAGE_FETCH_SUCCESS:
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
