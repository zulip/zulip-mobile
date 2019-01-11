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

const initialFetchStart = (state, action) => ({
  ...state,
  presence: true,
  subscriptions: true,
  unread: true,
  users: true,
});

const initialFetchComplete = (state, action) => ({
  ...state,
  presence: false,
  subscriptions: false,
  unread: false,
  users: false,
});

const initStreams = (state, action) => ({
  ...state,
  streams: false,
});

const initSubscriptions = (state, action) => ({
  ...state,
  subscriptions: false,
});

export default (state: LoadingState = initialState, action: Action): LoadingState => {
  switch (action.type) {
    case DEAD_QUEUE:
    case ACCOUNT_SWITCH:
      return initialState;

    case INITIAL_FETCH_START:
      return initialFetchStart(state, action);

    case INITIAL_FETCH_COMPLETE:
      return initialFetchComplete(state, action);

    case INIT_STREAMS:
      return initStreams(state, action);

    case INIT_SUBSCRIPTIONS:
      return initSubscriptions(state, action);

    default:
      return state;
  }
};
