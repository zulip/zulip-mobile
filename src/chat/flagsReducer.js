/* @flow strict-local */
import invariant from 'invariant';

import type { Action, FlagsState, Message } from '../types';
import {
  REALM_INIT,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
} from '../actionConstants';
import { deeperMerge } from '../utils/misc';

const initialState = {
  read: {},
  starred: {},
  collapsed: {},
  mentioned: {},
  wildcard_mentioned: {},
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
  flags: $ReadOnlyArray<string>,
): FlagsState => {
  if (messages.length === 0 || flags.length === 0) {
    return state;
  }

  // $FlowFixMe[incompatible-exact] - #4252
  const newState: FlagsState = {};

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
  // $FlowFixMe[incompatible-exact] - #4252
  const newState: FlagsState = {};
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

  /* $FlowFixMe[incompatible-indexer]: Flow can't follow this
     objects-as-maps logic. */
  return stateChanged ? deeperMerge(state, newState) : state;
};

const eventUpdateMessageFlags = (state, action) => {
  if (action.all) {
    if (action.op === 'add') {
      return addFlagsForMessages(initialState, Object.keys(action.allMessages).map(Number), [
        action.flag,
      ]);
    }

    if (action.op === 'remove') {
      return { ...state, [action.flag]: {} };
    }
  }

  if (action.op === 'add') {
    return addFlagsForMessages(state, action.messages, [action.flag]);
  }

  if (action.op === 'remove') {
    return removeFlagForMessages(state, action.messages, action.flag);
  }

  return state;
};

export default (state: FlagsState = initialState, action: Action): FlagsState => {
  switch (action.type) {
    case REALM_INIT:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_COMPLETE:
      return processFlagsForMessages(state, action.messages);

    case EVENT_NEW_MESSAGE: {
      invariant(action.message.flags, 'message in EVENT_NEW_MESSAGE must have flags');
      return addFlagsForMessages(state, [action.message.id], action.message.flags);
    }

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
