import Immutable from 'immutable';

import {
  ERROR_HANDLED,
} from './errorActions';

// Initial state
const initialState = new Immutable.Stack();

const reducer = (state = initialState, action) => {
  const { type, error } = action;

  if (type === ERROR_HANDLED) {
    // TODO: we probably want this stack to be bounded, so that
    // a lot of accumulated errors don't slow down the app
    return state.map((err) => ({
      ...err,
      active: action.errors.includes(err) ? false : err.active,
    }));
  } else if (error) {
    const timestamp = Date.now();
    return state.push({
      timestamp,
      type: action.type,
      message: error,
      active: true,
    });
  }

  return state;
};

export default reducer;
