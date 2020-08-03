/* @flow strict-local */
// import { Vibration } from 'react-native';

import { AppState } from 'react-native';
import type { GeneralEvent, GlobalState, MessageEvent } from '../types';
import { isHomeNarrow, isMessageInNarrow } from '../utils/narrow';
import { getActiveAccount, getChatScreenParams, getOwnEmail } from '../selectors';
import { playMessageSound } from '../utils/sound';
import { NULL_ARRAY } from '../nullObjects';

/**
 * React to incoming `MessageEvent`s.
 */
const messageEvent = (state: GlobalState, event: MessageEvent): void => {
  const flags = event.message.flags ?? event.flags ?? NULL_ARRAY;

  if (AppState.currentState !== 'active') {
    return;
  }

  const isPrivateMessage = Array.isArray(event.message.display_recipient);
  const isMentioned = flags.includes('mentioned') || flags.includes('wildcard_mentioned');
  if (!(isPrivateMessage || isMentioned)) {
    return;
  }

  const activeAccount = getActiveAccount(state);
  const { narrow } = getChatScreenParams(state);
  const isUserInSameNarrow =
    activeAccount
    && (narrow !== undefined // chat screen is not at top
      && (!isHomeNarrow(narrow) && isMessageInNarrow(event.message, narrow, activeAccount.email)));
  const isSenderSelf = getOwnEmail(state) === event.message.sender_email;
  if (!isUserInSameNarrow && !isSenderSelf) {
    playMessageSound();
    // Vibration.vibrate();
  }
};

/**
 * React to incoming Zulip server events (from `/events` polling).
 *
 * Inputs are not mutated.
 */
export default (state: GlobalState, event_: GeneralEvent) => {
  switch (event_.type) {
    case 'message': {
      // $FlowFixMe This expresses our unchecked assumptions about `message` events.
      messageEvent(state, (event_: MessageEvent));
      break;
    }
    default:
  }
};
