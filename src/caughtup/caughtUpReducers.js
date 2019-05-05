/* @flow strict-local */
import type { CaughtUp, CaughtUpState, Action } from '../types';
import {
  DEAD_QUEUE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { LAST_MESSAGE_ANCHOR, FIRST_UNREAD_ANCHOR } from '../constants';
import { NULL_OBJECT } from '../nullObjects';
import { DEFAULT_CAUGHTUP } from './caughtUpSelectors';

const initialState: CaughtUpState = NULL_OBJECT;

/** Try to infer the caught-up state, when the server didn't tell us. */
const legacyInferCaughtUp = (prevCaughtUp: CaughtUp | void, action) => {
  if (action.anchor === LAST_MESSAGE_ANCHOR) {
    return {
      older: action.numBefore > action.messages.length,
      newer: true,
    };
  }

  let anchorIdx = -1;

  if (action.anchor === FIRST_UNREAD_ANCHOR) {
    anchorIdx = action.messages.findIndex(msg => !msg.flags || msg.flags.indexOf('read') === -1);
  } else {
    anchorIdx = action.messages.findIndex(msg => msg.id === action.anchor);
  }

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

  const caughtUpOlder = anchorIdx < action.numBefore;
  const caughtUpNewer = action.messages.length - anchorIdx + adjustment < action.numAfter;

  const { older: prevOlder, newer: prevNewer } = prevCaughtUp || DEFAULT_CAUGHTUP;

  return {
    older: prevOlder || caughtUpOlder,
    newer: prevNewer || caughtUpNewer,
  };
};

export default (state: CaughtUpState = initialState, action: Action): CaughtUpState => {
  switch (action.type) {
    case DEAD_QUEUE:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE: {
      const key = JSON.stringify(action.narrow);
      let caughtUp;
      if (action.foundNewest !== undefined && action.foundOldest !== undefined) {
        /* This should always be the case for Zulip Server v1.8 or newer. */
        caughtUp = { older: action.foundOldest, newer: action.foundNewest };
      } else {
        caughtUp = legacyInferCaughtUp(state[key], action);
      }
      return {
        ...state,
        [key]: caughtUp,
      };
    }

    default:
      return state;
  }
};
