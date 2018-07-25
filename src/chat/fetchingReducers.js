/* @flow */
import type {
  FetchingState,
  Action,
  MessageFetchStartAction,
  MessageFetchCompleteAction,
} from '../types';
import {
  APP_REFRESH,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  FETCH_STATE_RESET,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { NULL_FETCHING, NULL_OBJECT } from '../nullObjects';

const initialState: FetchingState = NULL_OBJECT;

const messageFetchStart = (
  state: FetchingState,
  action: MessageFetchStartAction,
): FetchingState => {
  const key = JSON.stringify(action.narrow);
  const currentValue = state[key] || NULL_FETCHING;

  return {
    ...state,
    [key]: {
      older: action.numBefore > 0 || currentValue.older,
      newer: action.numAfter > 0 || currentValue.newer,
    },
  };
};

const messageFetchComplete = (
  state: FetchingState,
  action: MessageFetchCompleteAction,
): FetchingState => {
  const key = JSON.stringify(action.narrow);
  const currentValue = state[key] || NULL_FETCHING;

  return {
    ...state,
    [key]: {
      older: currentValue.older && action.numBefore === 0,
      newer: currentValue.newer && action.numAfter === 0,
    },
  };
};

export default (state: FetchingState = initialState, action: Action): FetchingState => {
  switch (action.type) {
    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case FETCH_STATE_RESET:
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
