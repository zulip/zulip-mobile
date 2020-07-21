/* @flow strict-local */
import type { FetchingState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  DO_NARROW,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { DEFAULT_FETCHING } from './fetchingSelectors';
import { isSearchNarrow } from '../utils/narrow';

const initialState: FetchingState = NULL_OBJECT;

const messageFetchStart = (state, action) => {
  // We don't want to accumulate old searches that we'll never need
  // again.
  if (isSearchNarrow(action.narrow)) {
    return state;
  }

  const key = JSON.stringify(action.narrow);
  const currentValue = state[key] || DEFAULT_FETCHING;

  return {
    ...state,
    [key]: {
      older: currentValue.older || action.numBefore > 0,
      newer: currentValue.newer || action.numAfter > 0,
    },
  };
};

const messageFetchComplete = (state, action) => {
  // We don't want to accumulate old searches that we'll never need again.
  if (isSearchNarrow(action.narrow)) {
    return state;
  }
  const key = JSON.stringify(action.narrow);
  const currentValue = state[key] || DEFAULT_FETCHING;

  return {
    ...state,
    [key]: {
      older: currentValue.older && !(action.numBefore > 0),
      newer: currentValue.newer && !(action.numAfter > 0),
    },
  };
};

export default (state: FetchingState = initialState, action: Action): FetchingState => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case DO_NARROW:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_START:
      return messageFetchStart(state, action);

    case MESSAGE_FETCH_COMPLETE:
      return messageFetchComplete(state, action);

    default:
      return state;
  }
};
