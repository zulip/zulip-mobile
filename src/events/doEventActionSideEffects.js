/* @flow strict-local */
// import { Vibration } from 'react-native';

import { AppState } from 'react-native';
import type { GlobalState, Message, ThunkAction } from '../types';
import type { EventAction } from '../actionTypes';
import { EVENT_NEW_MESSAGE, EVENT_TYPING_START } from '../actionConstants';
import { isHomeNarrow, isMessageInNarrow } from '../utils/narrow';
import { getActiveAccount, getChatScreenParams } from '../selectors';
import { NULL_ARRAY } from '../nullObjects';
import { ensureTypingStatusExpiryLoop } from '../typing/typingActions';
import { getOwnUserId } from '../users/userSelectors';

/**
 * React to incoming `MessageEvent`s.
 */
const messageEvent = (state: GlobalState, message: Message): void => {
  const flags = message.flags ?? NULL_ARRAY;

  if (AppState.currentState !== 'active') {
    return;
  }

  const isMentioned = flags.includes('mentioned') || flags.includes('wildcard_mentioned');
  if (!(message.type === 'private' || isMentioned)) {
    return;
  }

  const activeAccount = getActiveAccount(state);
  // Assume (unchecked) that `narrow` is `Narrow` if present
  // $FlowFixMe[cannot-resolve-name]
  const narrow: Narrow | void = getChatScreenParams().narrow;
  const isUserInSameNarrow =
    activeAccount
    && narrow !== undefined // chat screen is not at top
    && !isHomeNarrow(narrow)
    && isMessageInNarrow(message, flags, narrow, getOwnUserId(state));
  const isSenderSelf = getOwnUserId(state) === message.sender_id;
  if (!isUserInSameNarrow && !isSenderSelf) {
    // Vibration.vibrate();
  }
};

/**
 * React to actions dispatched for Zulip server events.
 *
 * To be dispatched before the event actions are dispatched.
 */
export default (action: EventAction): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  const state = getState();
  switch (action.type) {
    case EVENT_NEW_MESSAGE: {
      messageEvent(state, action.message);
      break;
    }
    case EVENT_TYPING_START:
      dispatch(ensureTypingStatusExpiryLoop());
      break;
    default:
  }
};
