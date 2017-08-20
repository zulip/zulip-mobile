/* @flow */
import type { CaughtUpState, Action } from '../types';
import { LOGOUT, LOGIN_SUCCESS, ACCOUNT_SWITCH, MESSAGE_FETCH_SUCCESS } from '../actionConstants';
import { NULL_CAUGHTUP } from '../nullObjects';

const initialState: CaughtUpState = {};

export default (state: CaughtUpState = initialState, action: Action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_SUCCESS: {
      if (!action.anchor) {
        return state;
      }

      const key = JSON.stringify(action.narrow);

      // Find the anchor in the results (or set it past the end of the list)
      let anchorIdx = action.messages.findIndex(msg => msg.id === action.anchor);
      if (anchorIdx === -1) {
        anchorIdx = action.messages.length;
      }

      // If we're requesting messages before the anchor, the server
      // returns one less than we expect (to avoid duplicating the anchor)
      const adjustment = action.numBefore > 0 ? -1 : 0;

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
    }

    default:
      return state;
  }
};
