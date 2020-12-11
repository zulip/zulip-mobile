/* @flow strict-local */
import union from 'lodash.union';
import Immutable from 'immutable';

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
  getNarrowsForMessage,
  MENTIONED_NARROW_STR,
  STARRED_NARROW_STR,
  isSearchNarrow,
} from '../utils/narrow';

const initialState: NarrowsState = Immutable.Map();

const messageFetchComplete = (state, action) => {
  // We don't want to accumulate old searches that we'll never need again.
  if (isSearchNarrow(action.narrow)) {
    return state;
  }
  const key = JSON.stringify(action.narrow);
  const fetchedMessageIds = action.messages.map(message => message.id);
  const replaceExisting =
    action.anchor === FIRST_UNREAD_ANCHOR || action.anchor === LAST_MESSAGE_ANCHOR;
  return state.set(
    key,
    replaceExisting
      ? fetchedMessageIds
      : union(state.get(key), fetchedMessageIds).sort((a, b) => a - b),
  );
};

const eventNewMessage = (state, action) => {
  const { message } = action;
  const { flags } = message;

  if (!flags) {
    throw new Error('EVENT_NEW_MESSAGE message missing flags');
  }

  return state.withMutations(stateMutable => {
    const narrowsForMessage = getNarrowsForMessage(message, action.ownUser, flags);

    narrowsForMessage.forEach(narrow => {
      const key = JSON.stringify(narrow);
      const value = stateMutable.get(key);

      if (!value) {
        // We haven't loaded this narrow. The time to add a new key
        // isn't now; we do that in MESSAGE_FETCH_COMPLETE, when we
        // might have a reasonably long, contiguous list of messages
        // to show.
        return; // i.e., continue
      }

      // (No guarantee that `key` is in `action.caughtUp`)
      // flowlint-next-line unnecessary-optional-chain:off
      if (!action.caughtUp[key]?.newer) {
        // Don't add a message to the end of the list unless we know
        // it's the most recent message, i.e., unless we know we're
        // currently looking at (caught up with) the newest messages in
        // the narrow.
        return; // i.e., continue
      }

      if (value.some(id => action.message.id === id)) {
        // Don't add a message that's already been added. It's probably
        // very rare for a message to have already been added when we
        // get an EVENT_NEW_MESSAGE, and perhaps impossible. (TODO:
        // investigate?)
        return; // i.e., continue
      }

      stateMutable.set(key, [...value, message.id]);
    });
  });
};

const eventMessageDelete = (state, action) => {
  let stateChange = false;
  const newState = state.map((value, key) => {
    const result = value.filter(id => !action.messageIds.includes(id));
    stateChange = stateChange || result.length < value.length;
    return result;
  });
  return stateChange ? newState : state;
};

const updateFlagNarrow = (state, narrowStr, operation, messageIds): NarrowsState => {
  const value = state.get(narrowStr);
  if (!value) {
    return state;
  }
  switch (operation) {
    case 'add': {
      return state.set(narrowStr, [...value, ...messageIds].sort((a, b) => a - b));
    }
    case 'remove': {
      const messageIdSet = new Set(messageIds);
      return state.set(narrowStr, value.filter(id => !messageIdSet.has(id)));
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
