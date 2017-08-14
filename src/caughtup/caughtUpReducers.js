/* @flow */
import type { CaughtUpState, Action } from '../types';
import {
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_SUCCESS,
} from '../actionConstants';

const initialState: CaughtUpState = {};

export default (state: CaughtUpState = initialState, action: Action) => {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;
    case MESSAGE_FETCH_START: {
      const key = JSON.stringify(action.narrow);
      return {
        ...state,
        [key]: {
          older: action.fetchingOlder,
          newer: action.fetchingNewer,
        },
      };
    }

    case MESSAGE_FETCH_SUCCESS: {
      const key = JSON.stringify(action.narrow);

      // Find the anchor in the results (or set it past the end of the list)
      // Then use its position  to determine if we're caught up in both directions.
      const msgIndex = action.messages.findIndex(msg => msg.id === action.anchor);
      const anchorIdx = msgIndex === -1 ? action.messages.length : msgIndex;

      // If we're requesting messages before the anchor, the server
      // returns one less than we expect (to avoid duplicating the anchor)
      const adjustment = action.numBefore > 0 ? -1 : 0;

      return {
        ...state,
        [key]: {
          older: anchorIdx + 1 < action.numBefore,
          newer: action.messages.length - anchorIdx + adjustment < action.numAfter,
        },
      };
    }

    default:
      return state;
  }
};
