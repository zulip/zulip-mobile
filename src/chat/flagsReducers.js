/* @flow strict-local */
import type {
  FlagsAction,
  FlagsState,
  Message,
  MessageFetchCompleteAction,
  EventNewMessageAction,
  EventUpdateMessageFlagsAction,
  MarkMessagesReadAction,
} from '../types';
import {
  APP_REFRESH,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  MARK_MESSAGES_READ,
  ACCOUNT_SWITCH,
} from '../actionConstants';
import { deeperMerge } from '../utils/misc';

const initialState = {
  read: {},
  starred: {},
  collapsed: {},
  mentions: {},
  wildcard_mentions: {},
  summarize_in_home: {},
  summarize_in_stream: {},
  force_expand: {},
  force_collapse: {},
  has_alert_word: {},
  historical: {},
  is_me_message: {},
};

const addFlagsForMessages = (
  state: FlagsState,
  messages: $ReadOnlyArray<number>,
  flags?: $ReadOnlyArray<string>,
): FlagsState => {
  if (!messages || messages.length === 0 || !flags || flags.length === 0) {
    return state;
  }

  const newState = {};

  flags.forEach(flag => {
    newState[flag] = { ...(state[flag] || {}) };

    messages.forEach(message => {
      newState[flag][message] = true;
    });
  });

  return {
    ...state,
    ...newState,
  };
};

const removeFlagForMessages = (state: FlagsState, messages: number[], flag: string): FlagsState => {
  const newStateForFlag = { ...(state[flag] || {}) };
  messages.forEach(message => {
    delete newStateForFlag[message];
  });
  return {
    ...state,
    [flag]: newStateForFlag,
  };
};

const processFlagsForMessages = (state: FlagsState, messages: Message[]): FlagsState => {
  let stateChanged = false;
  const newState = {};
  messages.forEach(msg => {
    (msg.flags || []).forEach(flag => {
      if (!state[flag] || !state[flag][msg.id]) {
        if (!newState[flag]) {
          newState[flag] = {};
        }
        newState[flag][msg.id] = true;
        stateChanged = true;
      }
    });
  });

  return stateChanged ? deeperMerge(state, newState) : state;
};

const messageFetchComplete = (state: FlagsState, action: MessageFetchCompleteAction): FlagsState =>
  processFlagsForMessages(state, action.messages);

const eventNewMessage = (state: FlagsState, action: EventNewMessageAction): FlagsState =>
  addFlagsForMessages(state, [action.message.id], action.message.flags);

const eventUpdateMessageFlags = (
  state: FlagsState,
  action: EventUpdateMessageFlagsAction,
): FlagsState => {
  if (action.all) {
    return addFlagsForMessages(initialState, Object.keys(action.allMessages).map(Number), ['read']);
  }

  if (action.operation === 'add') {
    return addFlagsForMessages(state, action.messages, [action.flag]);
  }

  if (action.operation === 'remove') {
    return removeFlagForMessages(state, action.messages, action.flag);
  }

  return state;
};

const markMessagesRead = (state: FlagsState, action: MarkMessagesReadAction): FlagsState =>
  addFlagsForMessages(state, action.messageIds, ['read']);

export default (state: FlagsState = initialState, action: FlagsAction): FlagsState => {
  switch (action.type) {
    case APP_REFRESH:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE:
      return messageFetchComplete(state, action);

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    case MARK_MESSAGES_READ:
      return markMessagesRead(state, action);

    default:
      return state;
  }
};
