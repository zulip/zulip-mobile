/* @flow strict-local */
import type { LoadingState, Action } from '../types';
import {
  DEAD_QUEUE,
  ACCOUNT_SWITCH,
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  INIT_STREAMS,
  INIT_SUBSCRIPTIONS,
} from '../actionConstants';

const initialState: LoadingState = {
  presence: false,
  subscriptions: false,
  streams: false,
  unread: false,
  users: false,
};

export default (state: LoadingState = initialState, action: Action): LoadingState => {
  switch (action.type) {
    case DEAD_QUEUE:
    case ACCOUNT_SWITCH:
      return initialState;

    case INITIAL_FETCH_START:
      return { ...state, presence: true, subscriptions: true, unread: true, users: true };

    case INITIAL_FETCH_COMPLETE:
      return { ...state, presence: false, subscriptions: false, unread: false, users: false };

    case INIT_STREAMS:
      return { ...state, streams: false };

    case INIT_SUBSCRIPTIONS:
      return { ...state, subscriptions: false };

    default:
      return state;
  }
};
