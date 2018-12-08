/* @flow strict-local */
import type {
  LoadingState,
  LoadingAction,
  InitialFetchStartAction,
  InitialFetchCompleteAction,
  InitStreamsAction,
  InitSubscriptionsAction,
} from '../types';
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

const initialFetchStart = (state: LoadingState, action: InitialFetchStartAction): LoadingState => ({
  ...state,
  presence: true,
  subscriptions: true,
  unread: true,
  users: true,
});

const initialFetchComplete = (
  state: LoadingState,
  action: InitialFetchCompleteAction,
): LoadingState => ({
  ...state,
  presence: false,
  subscriptions: false,
  unread: false,
  users: false,
});

const initStreams = (state: LoadingState, action: InitStreamsAction): LoadingState => ({
  ...state,
  streams: false,
});

const initSubscriptions = (state: LoadingState, action: InitSubscriptionsAction): LoadingState => ({
  ...state,
  subscriptions: false,
});

export default (state: LoadingState = initialState, action: LoadingAction): LoadingState => {
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
