/* @flow */
import type { Action, TypingState } from '../types';
import {
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  CLEAR_TYPING_NOTIFICATIONS,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  REALM_INIT,
} from '../actionConstants';
import { normalizeRecipientsSansMe } from '../utils/message';
import { NULL_OBJECT } from '../nullObjects';

const initialState: TypingState = NULL_OBJECT;

export default (state: TypingState = initialState, action: Action): TypingState => {
  switch (action.type) {
    case EVENT_TYPING_START: {
      if (action.sender.email === action.ownEmail) {
        // don't change state when self is typing
        return state;
      }

      const normalizedRecipients = normalizeRecipientsSansMe(action.recipients, action.ownEmail);
      const previousTypingUsers = state[normalizedRecipients] || { userIds: [] };

      const isUserAlreadyTyping = previousTypingUsers.userIds.indexOf(action.sender.user_id);
      if (isUserAlreadyTyping > -1) {
        return {
          ...state,
          [normalizedRecipients]: {
            userIds: [...previousTypingUsers.userIds],
            time: action.time,
          },
        };
      }

      return {
        ...state,
        [normalizedRecipients]: {
          userIds: [...previousTypingUsers.userIds, action.sender.user_id],
          time: action.time,
        },
      };
    }

    case EVENT_TYPING_STOP: {
      const normalizedRecipients = normalizeRecipientsSansMe(action.recipients, action.ownEmail);
      const previousTypingUsers = state[normalizedRecipients];

      if (!previousTypingUsers) {
        return state;
      }

      const newTypingUsers = state[normalizedRecipients].userIds.filter(
        userId => userId !== action.sender.user_id,
      );

      if (newTypingUsers.length > 0) {
        return {
          ...state,
          [normalizedRecipients]: {
            time: action.time,
            userIds: newTypingUsers,
          },
        };
      }

      // if key is empty now, remove the key
      const newState = { ...state };
      delete newState[normalizedRecipients];
      return newState;
    }

    case CLEAR_TYPING_NOTIFICATIONS: {
      const newState = { ...state };
      action.outdatedNotifications.map(recipients => delete newState[recipients]);
      return newState;
    }

    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
    case REALM_INIT:
      return initialState;

    default:
      return state;
  }
};
