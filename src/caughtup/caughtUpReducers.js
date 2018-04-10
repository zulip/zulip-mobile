/* @flow */
import type { CaughtUpState, CaughtUpAction, MessageFetchCompleteAction } from '../types';
import {
  APP_REFRESH,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { NULL_CAUGHTUP, NULL_OBJECT } from '../nullObjects';

const initialState: CaughtUpState = NULL_OBJECT;

const messageFetchComplete = (
  state: CaughtUpState,
  action: MessageFetchCompleteAction,
): CaughtUpState => {
  const key = JSON.stringify(action.narrow);

  if (action.anchor === Number.MAX_SAFE_INTEGER) {
    return {
      ...state,
      [key]: {
        older: action.numBefore > action.messages.length,
        newer: true,
      },
    };
  }

  // Find the anchor in the results (or set it past the end of the list)
  let anchorIdx = action.messages.findIndex(msg => msg.id === action.anchor);
  if (anchorIdx === -1) {
    anchorIdx = action.messages.length;
  }
  const totalMessagesRequested = action.numBefore + action.numAfter;
  // If we're requesting messages before the anchor, the server
  // returns one less than we expect (to avoid duplicating the anchor)
  // only do adjustment if messages are more than expected
  const adjustment =
    action.messages.length > totalMessagesRequested && action.numBefore > 0
      ? -(action.messages.length - totalMessagesRequested)
      : 0;

  const caughtUpOlder = anchorIdx + 1 < action.numBefore;
  const caughtUpNewer = action.messages.length - anchorIdx + adjustment < action.numAfter;

  const prevState = state[key] || NULL_CAUGHTUP;

  return {
    ...state,
    [key]: {
      older: prevState.older || caughtUpOlder,
      newer: prevState.newer || caughtUpNewer,
    },
  };
};

export default (state: CaughtUpState = initialState, action: CaughtUpAction): CaughtUpState => {
  switch (action.type) {
    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE:
      return messageFetchComplete(state, action);

    default:
      return state;
  }
};
