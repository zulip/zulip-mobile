/* @flow */
import type {
  TypingAction,
  EventTypingStartAction,
  EventTypingStopAction,
  ClearTypingAction,
  TypingState,
} from '../types';
import {
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  CLEAR_TYPING,
  APP_REFRESH,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
} from '../actionConstants';
import { normalizeRecipientsSansMe } from '../utils/message';
import { NULL_OBJECT } from '../nullObjects';

const initialState: TypingState = NULL_OBJECT;

const eventTypingStart = (state: TypingState, action: EventTypingStartAction): TypingState => {
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
};

const eventTypingStop = (state: TypingState, action: EventTypingStopAction): TypingState => {
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
};

const clearTyping = (state: TypingState, action: ClearTypingAction): TypingState => {
  const newState = { ...state };
  action.outdatedNotifications.map(recipients => delete newState[recipients]);
  return newState;
};

export default (state: TypingState = initialState, action: TypingAction): TypingState => {
  switch (action.type) {
    case EVENT_TYPING_START:
      return eventTypingStart(state, action);

    case EVENT_TYPING_STOP:
      return eventTypingStop(state, action);

    case CLEAR_TYPING:
      return clearTyping(state, action);

    case APP_REFRESH:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
