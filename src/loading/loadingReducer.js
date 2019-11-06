/* @flow strict-local */
import type { LoadingState, Action } from '../types';
import {
  DEAD_QUEUE,
  LOGOUT,
  ACCOUNT_SWITCH,
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
} from '../actionConstants';

const initialState: LoadingState = {
  unread: false,
};

export default (state: LoadingState = initialState, action: Action): LoadingState => {
  switch (action.type) {
    case DEAD_QUEUE:
    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case INITIAL_FETCH_START:
      return { unread: true };

    case INITIAL_FETCH_COMPLETE:
      return { unread: false };

    default:
      return state;
  }
};
