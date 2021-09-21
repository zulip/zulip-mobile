/* @flow strict-local */
import type { CaughtUpState, PerAccountApplicableAction } from '../types';
import {
  REGISTER_COMPLETE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { DEFAULT_CAUGHTUP } from './caughtUpSelectors';
import { isSearchNarrow, keyFromNarrow } from '../utils/narrow';

const initialState: CaughtUpState = NULL_OBJECT;

export default (
  state: CaughtUpState = initialState,
  action: PerAccountApplicableAction,
): CaughtUpState => {
  switch (action.type) {
    case REGISTER_COMPLETE:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_START: {
      // We don't want to accumulate old searches that we'll never
      // need again.
      if (isSearchNarrow(action.narrow)) {
        return state;
      }
      // Currently this whole case could be subsumed in `default`. But
      // we don't want to add this case with something else in mind,
      // later, and forget about the search-narrow check above.
      return state;
    }

    /**
     * The reverse of MESSAGE_FETCH_START, for cleanup.
     */
    case MESSAGE_FETCH_ERROR: {
      return state;
    }

    case MESSAGE_FETCH_COMPLETE: {
      // We don't want to accumulate old searches that we'll never need again.
      if (isSearchNarrow(action.narrow)) {
        return state;
      }
      const key = keyFromNarrow(action.narrow);
      const { older: prevOlder, newer: prevNewer } = state[key] || DEFAULT_CAUGHTUP;
      return {
        ...state,
        [key]: {
          older: prevOlder || action.foundOldest,
          newer: prevNewer || action.foundNewest,
        },
      };
    }

    default:
      return state;
  }
};
