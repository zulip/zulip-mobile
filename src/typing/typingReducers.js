/* @flow */
import type { Action, TypingState } from '../types';
import { EVENT_TYPING_START, EVENT_TYPING_STOP } from '../actionConstants';
import { normalizeRecipientsSansMe } from '../utils/message';
import { NULL_ARRAY } from '../nullObjects';

const initialState: TypingState = {};

export default (state: TypingState = initialState, action: Action): TypingState => {
  switch (action.type) {
    case EVENT_TYPING_START: {
      const normalizedRecipients = normalizeRecipientsSansMe(action.recipients, action.ownEmail);
      const previousTypingUsers = state[normalizedRecipients] || NULL_ARRAY;

      const isUserAlreadyTyping = previousTypingUsers.indexOf(action.sender.user_id);
      if (isUserAlreadyTyping > -1) {
        return state;
      }

      return {
        ...state,
        [normalizedRecipients]: [...previousTypingUsers, action.sender.user_id],
      };
    }

    case EVENT_TYPING_STOP: {
      const normalizedRecipients = normalizeRecipientsSansMe(action.recipients, action.ownEmail);
      const previousTypingUsers = state[normalizedRecipients];

      if (!previousTypingUsers) {
        return state;
      }

      const newTypingUsers = state[normalizedRecipients].filter(
        userId => userId !== action.sender.user_id,
      );

      if (newTypingUsers.length > 0) {
        return {
          ...state,
          [normalizedRecipients]: newTypingUsers,
        };
      }

      // if key is empty now, remove the key
      const newState = { ...state };
      delete newState[normalizedRecipients];
      return newState;
    }

    default:
      return state;
  }
};
