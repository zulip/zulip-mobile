import {
  ERROR_HANDLED,
} from './errorActions';

import Immutable from 'immutable';

// Initial state
const initialState = new Immutable.Stack();

const reducer = (state = initialState, action) => {
  const { type, error } = action;

  if (type === ERROR_HANDLED) {
    return new Immutable.Stack();
  } else if (error) {
    const timestamp = Date.now();
    return state.push({
      timestamp,
      message: error,
      handled: false,
    });
  }

  return state;
};

export default reducer;
