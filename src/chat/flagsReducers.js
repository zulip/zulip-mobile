/* @flow */
import type { Action, FlagsState, Message } from '../types';
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

const addFlagsForMessages = (state: FlagsState, messages, flags: string[]): FlagsState => {
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

const removeFlagForMessages = (state: FlagsState, messages, flag: string[]): FlagsState => {
  const newStateForFlag = { ...(state[flag] || {}) };
  messages.forEach(message => {
    delete newStateForFlag[message];
  });
  return {
    ...state,
    [flag]: newStateForFlag,
  };
};

export default (state: FlagsState = initialState, action: Action): FlagsState => {
  switch (action.type) {
    case APP_REFRESH:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE: {
      let stateChanged = false;
      const newState = {};
      action.messages.forEach(msg => {
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
    }

    case EVENT_NEW_MESSAGE:
      return addFlagsForMessages(state, [action.message.id], action.message.flags);

    case EVENT_UPDATE_MESSAGE_FLAGS: {
      if (action.all) {
        const allMessages: any[] = [].concat(
          ...Object.values(action.allMessages)
        );
        return addFlagsForMessages(initialState, allMessages.map(msg => msg.id), ['read']);
      }

      if (action.operation === 'add') {
        return addFlagsForMessages(state, action.messages, [action.flag]);
      }

      if (action.operation === 'remove') {
        return removeFlagForMessages(state, action.messages, action.flag);
      }

      return state;
    }

    case MARK_MESSAGES_READ:
      return addFlagsForMessages(state, action.messageIds, ['read']);

    default:
      return state;
  }
};
