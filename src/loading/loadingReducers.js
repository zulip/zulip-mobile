/* @flow strict-local */
import type { LoadingState, Action } from '../types';
import {
  DEAD_QUEUE,
  ACCOUNT_SWITCH,
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
} from '../actionConstants';

const initialState: LoadingState = {
  unread: false,
  users: false,
};

export default (state: LoadingState = initialState, action: Action): LoadingState => {
  switch (action.type) {
    case DEAD_QUEUE:
    case ACCOUNT_SWITCH:
      return initialState;

    case INITIAL_FETCH_START:
      return { unread: true, users: true };

    case INITIAL_FETCH_COMPLETE:
      return { unread: false, users: false };

    default:
      return state;
  }
};
