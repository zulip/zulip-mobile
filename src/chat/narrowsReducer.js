/* @flow strict-local */
import union from 'lodash.union';

import type { NarrowsState, Action } from '../types';
import { ensureUnreachable } from '../types';
import {
  REALM_INIT,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
} from '../actionConstants';
import { LAST_MESSAGE_ANCHOR, FIRST_UNREAD_ANCHOR } from '../anchor';
import {
  isMessageInNarrow,
  MENTIONED_NARROW_STR,
  STARRED_NARROW_STR,
  isSearchNarrow,
} from '../utils/narrow';
import { NULL_OBJECT } from '../nullObjects';

const initialState: NarrowsState = NULL_OBJECT;

const messageFetchComplete = (state, action) => {
  // We don't want to accumulate old searches that we'll never need again.
  if (isSearchNarrow(action.narrow)) {
    return state;
  }
  const key = JSON.stringify(action.narrow);
  const fetchedMessageIds = action.messages.map(message => message.id);
  const replaceExisting =
    action.anchor === FIRST_UNREAD_ANCHOR || action.anchor === LAST_MESSAGE_ANCHOR;
  return {
    ...state,
    [key]: replaceExisting
      ? fetchedMessageIds
      : union(state[key], fetchedMessageIds).sort((a, b) => a - b),
  };
};

const eventNewMessage = (state, action) => {
  let stateChange = false;
  const newState: NarrowsState = {};
  Object.keys(state).forEach(key => {
    const { flags } = action.message;
    if (!flags) {
      throw new Error('EVENT_NEW_MESSAGE message missing flags');
    }
    const isInNarrow = isMessageInNarrow(action.message, flags, JSON.parse(key), action.ownEmail);
    const isCaughtUp = action.caughtUp[key] && action.caughtUp[key].newer;
    const messageDoesNotExist = state[key].find(id => action.message.id === id) === undefined;

    if (isInNarrow && isCaughtUp && messageDoesNotExist) {
      stateChange = true;
      newState[key] = [...state[key], action.message.id];
    } else {
      newState[key] = state[key];
    }
  });
  return stateChange ? newState : state;
};

const eventMessageDelete = (state, action) => {
  let stateChange = false;
  const newState: NarrowsState = {};
  Object.keys(state).forEach(key => {
    newState[key] = state[key].filter(id => !action.messageIds.includes(id));
    stateChange = stateChange || newState[key].length < state[key].length;
  });
  return stateChange ? newState : state;
};

const updateFlagNarrow = (state, narrowStr, operation, messageIds): NarrowsState => {
  if (!state[narrowStr]) {
    return state;
  }
  switch (operation) {
    case 'add':
      return {
        ...state,
        [narrowStr]: [...state[narrowStr], ...messageIds].sort((a, b) => a - b),
      };
    case 'remove': {
      const messageIdSet = new Set(messageIds);
      return {
        ...state,
        [narrowStr]: state[narrowStr].filter(id => !messageIdSet.has(id)),
      };
    }
    default:
      ensureUnreachable(operation);
      throw new Error(`Unexpected operation ${operation} in an EVENT_UPDATE_MESSAGE_FLAGS action`);
  }
};

const eventUpdateMessageFlags = (state, action) => {
  const { flag, operation, messages: messageIds } = action;
  if (flag === 'starred') {
    return updateFlagNarrow(state, STARRED_NARROW_STR, operation, messageIds);
  } else if (['mentioned', 'wildcard_mentioned'].includes(flag)) {
    return updateFlagNarrow(state, MENTIONED_NARROW_STR, operation, messageIds);
  }
  return state;
};

export default (state: NarrowsState = initialState, action: Action): NarrowsState => {
  switch (action.type) {
    case REALM_INIT:
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case MESSAGE_FETCH_START: {
      // We don't want to accumulate old searches that we'll never need again.
      if (isSearchNarrow(action.narrow)) {
        return state;
      }
      // Currently this whole case could be subsumed in `default`. But
      // we don't want to add this case with something else in mind,
      // later, and forget about the search-narrow check above.
      return state;
    }

    /**
     * The reverse of MESSAGE_FETCH_START, for cleanup.
     */
    case MESSAGE_FETCH_ERROR: {
      return state;
    }

    case MESSAGE_FETCH_COMPLETE: {
      return messageFetchComplete(state, action);
    }

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_MESSAGE_DELETE:
      return eventMessageDelete(state, action);

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
