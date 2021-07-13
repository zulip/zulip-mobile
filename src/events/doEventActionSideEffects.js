/* @flow strict-local */
// import { Vibration } from 'react-native';

import type { ThunkAction } from '../types';
import type { EventAction } from '../actionTypes';
import { EVENT_TYPING_START } from '../actionConstants';
import { ensureTypingStatusExpiryLoop } from '../typing/typingActions';

/**
 * React to actions dispatched for Zulip server events.
 *
 * To be dispatched before the event actions are dispatched.
 */
export default (action: EventAction): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  switch (action.type) {
    case EVENT_TYPING_START:
      dispatch(ensureTypingStatusExpiryLoop());
      break;
    default:
  }
};
