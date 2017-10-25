/* @flow */
import type { CaughtUpState, Action } from '../types';
import {
  APP_REFRESH,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { NULL_CAUGHTUP, NULL_OBJECT } from '../nullObjects';

const initialState: CaughtUpState = NULL_OBJECT;

export default (state: CaughtUpState = initialState, action: Action) => {
  switch (action.type) {
    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE: {
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

      // if already caughtUp in one direction then fetch of another direction
      // should not affect caughtUp of other
      const caughtUpOlder =
        (!action.replaceExisting && state[key] && state[key].older) ||
        anchorIdx + 1 < action.numBefore;
      const caughtUpNewer =
        (!action.replaceExisting && (state[key] && state[key].newer)) ||
        action.messages.length - anchorIdx + adjustment < action.numAfter;

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
