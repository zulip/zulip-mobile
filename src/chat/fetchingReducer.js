/* @flow strict-local */
import type { FetchingState, PerAccountApplicableAction } from '../types';
import {
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
  RESET_ACCOUNT_DATA,
  REGISTER_COMPLETE,
} from '../actionConstants';
import { NULL_OBJECT } from '../nullObjects';
import { DEFAULT_FETCHING } from './fetchingSelectors';
import { isSearchNarrow, keyFromNarrow } from '../utils/narrow';

const initialState: FetchingState = NULL_OBJECT;

const messageFetchStart = (state, action) => {
  // We don't want to accumulate old searches that we'll never need
  // again.
  if (isSearchNarrow(action.narrow)) {
    return state;
  }

  const key = keyFromNarrow(action.narrow);
  const currentValue = state[key] || DEFAULT_FETCHING;

  return {
    ...state,
    [key]: {
      older: currentValue.older || action.numBefore > 0,
      newer: currentValue.newer || action.numAfter > 0,
    },
  };
};

const messageFetchError = (state, action) => {
  const key = keyFromNarrow(action.narrow);

  if (isSearchNarrow(action.narrow)) {
    return state;
  }

  return {
    ...state,
    [key]: DEFAULT_FETCHING,
  };
};

const messageFetchComplete = (state, action) => {
  // We don't want to accumulate old searches that we'll never need again.
  if (isSearchNarrow(action.narrow)) {
    return state;
  }
  const key = keyFromNarrow(action.narrow);
  const currentValue = state[key] || DEFAULT_FETCHING;

  return {
    ...state,
    [key]: {
      older: currentValue.older && !(action.numBefore > 0),
      newer: currentValue.newer && !(action.numAfter > 0),
    },
  };
};

export default (
  state: FetchingState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): FetchingState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    // Reset just because `fetching` is server-data metadata, and we're
    // resetting the server data it's supposed to apply to… But really, we
    // should have canceled any in-progress message fetches by now; that's
    // #5623. Still, even if there is an in-progress fetch, we probably
    // don't want to show loading indicators for it in the UI.
    // TODO(#5623): Remove reference to #5623.
    case REGISTER_COMPLETE:
      return initialState;

    case MESSAGE_FETCH_START:
      return messageFetchStart(state, action);

    /**
     * The reverse of MESSAGE_FETCH_START, for cleanup.
     */
    case MESSAGE_FETCH_ERROR: {
      return messageFetchError(state, action);
    }

    case MESSAGE_FETCH_COMPLETE:
      return messageFetchComplete(state, action);

    default:
      return state;
  }
};
