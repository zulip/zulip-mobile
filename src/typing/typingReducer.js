/* @flow strict-local */
import type { Action, TypingState } from '../types';
import {
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  CLEAR_TYPING,
  DEAD_QUEUE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
} from '../actionConstants';
import { normalizeRecipientsAsUserIdsSansMe } from '../utils/recipient';
import { NULL_OBJECT } from '../nullObjects';

const initialState: TypingState = NULL_OBJECT;

const eventTypingStart = (state, action) => {
  if (action.sender.user_id === action.ownUserId) {
    // don't change state when self is typing
    return state;
  }

  const normalizedRecipients: string = normalizeRecipientsAsUserIdsSansMe(
    action.recipients.map(r => r.user_id),
    action.ownUserId,
  );
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
};

const eventTypingStop = (state, action) => {
  const normalizedRecipients: string = normalizeRecipientsAsUserIdsSansMe(
    action.recipients.map(r => r.user_id),
    action.ownUserId,
  );
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
};

const clearTyping = (state, action) => {
  const newState = { ...state };
  action.outdatedNotifications.map(recipients => delete newState[recipients]);
  return newState;
};

export default (state: TypingState = initialState, action: Action): TypingState => {
  switch (action.type) {
    case EVENT_TYPING_START:
      return eventTypingStart(state, action);

    case EVENT_TYPING_STOP:
      return eventTypingStop(state, action);

    case CLEAR_TYPING:
      return clearTyping(state, action);

    case DEAD_QUEUE:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
