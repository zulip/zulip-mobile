/* @flow strict-local */
// $FlowFixMe[untyped-import]
import union from 'lodash.union';
import Immutable from 'immutable';

import type { NarrowsState, PerAccountApplicableAction } from '../types';
import { ensureUnreachable } from '../types';
import {
  REGISTER_COMPLETE,
  LOGOUT,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_ERROR,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_UPDATE_MESSAGE,
} from '../actionConstants';
import { LAST_MESSAGE_ANCHOR, FIRST_UNREAD_ANCHOR } from '../anchor';
import {
  getNarrowsForMessage,
  MENTIONED_NARROW_STR,
  STARRED_NARROW_STR,
  isSearchNarrow,
  keyFromNarrow,
  topicNarrow,
  streamNarrow,
} from '../utils/narrow';

const initialState: NarrowsState = Immutable.Map();

function removeMessages(state: NarrowsState, narrow, messageIds): NarrowsState {
  return state.update(
    keyFromNarrow(narrow),
    messages => messages && messages.filter(id => !messageIds.has(id)),
  );
}

/**
 * Incorporate possibly old, possibly discontiguous, messages in the narrow.
 *
 * This differs from the MESSAGE_FETCH_COMPLETE case in that we aren't
 * assured that the messages listed are a contiguous segment of the full
 * list of messages in the narrow.  (For example, someone may have merged
 * one conversation into another, where some messages already in the
 * destination conversation fall in between some of the moved messages.)
 */
// We need to maintain the state.narrows invariant -- the fact that the
// message IDs we have in a narrow should be a contiguous segment of the
// full list of messages that actually exist in the narrow.  That can
// prevent us from adding the messages to our record of the narrow, and
// force us to instead downgrade how much we think we know about the narrow.
function addMessages(state: NarrowsState, narrow, messageIds): NarrowsState {
  // NOTE: This behavior must stay parallel with how the caughtUp reducer
  //   handles the same cases.
  const key = keyFromNarrow(narrow);

  // TODO: If the state at the narrow covers the given messages, then
  //   incorporate them.

  // TODO: If the state at a *parent* narrow -- in particular the stream
  //   narrow, if this is a topic narrow -- covers the given messages, then
  //   use that.

  // Do what's simple and always correct, even when not optimal: stop
  // claiming to know anything about the narrow.  (The caughtUp reducer must
  // also delete its record.)
  return state.delete(key);
}

const messageFetchComplete = (state, action) => {
  // We don't want to accumulate old searches that we'll never need again.
  if (isSearchNarrow(action.narrow)) {
    return state;
  }
  const key = keyFromNarrow(action.narrow);
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
    const narrowsForMessage = getNarrowsForMessage(message, action.ownUserId, flags);

    narrowsForMessage.forEach(narrow => {
      const key = keyFromNarrow(narrow);
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
        // currently looking at (caught up with) the newest messages
        // in the narrow. We don't want to accidentally show a message
        // at the end of a message list if there might be messages
        // between the currently latest-shown message and this
        // message.
        //
        // See a corresponding condition in messagesReducer, where we
        // don't bother to add to `state.messages` if this condition
        // (after running on all of `narrowsForMessage`) means the new
        // message wasn't added anywhere in `state.narrows`.
        return; // i.e., continue
      }

      if (value.some(id => action.message.id === id)) {
        // Don't add a message that's already been added. It's probably
        // very rare for a message to have already been added when we
        // get an EVENT_NEW_MESSAGE, and perhaps impossible. (TODO:
        // investigate?)
        return; // i.e., continue
      }

      // If changing or removing a case where we ignore a message
      // here: Careful! Every message in `state.narrows` must exist in
      // `state.messages`. If we choose to include a message in
      // `state.narrows`, then messagesReducer MUST ALSO choose to
      // include it in `state.messages`.

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

const updateFlagNarrow = (state, narrowStr, op, messageIds): NarrowsState => {
  const value = state.get(narrowStr);
  if (!value) {
    return state;
  }
  switch (op) {
    case 'add': {
      return state.set(
        narrowStr,
        [...value, ...messageIds].sort((a, b) => a - b),
      );
    }
    case 'remove': {
      const messageIdSet = new Set(messageIds);
      return state.set(
        narrowStr,
        value.filter(id => !messageIdSet.has(id)),
      );
    }
    default:
      ensureUnreachable(op);
      throw new Error(`Unexpected operation ${op} in an EVENT_UPDATE_MESSAGE_FLAGS action`);
  }
};

const eventUpdateMessageFlags = (state, action) => {
  const { flag, op, messages: messageIds } = action;
  if (flag === 'starred') {
    return updateFlagNarrow(state, STARRED_NARROW_STR, op, messageIds);
  } else if (['mentioned', 'wildcard_mentioned'].includes(flag)) {
    return updateFlagNarrow(state, MENTIONED_NARROW_STR, op, messageIds);
  }
  return state;
};

export default (
  state: NarrowsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): NarrowsState => {
  switch (action.type) {
    case REGISTER_COMPLETE:
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

    case EVENT_UPDATE_MESSAGE: {
      // Compare the corresponding caughtUpReducer case.

      let result: NarrowsState = state;
      const { event, move } = action;

      if (move) {
        // The edit changed topic and/or stream.
        const { orig_stream_id, orig_topic, new_stream_id, new_topic } = move;
        const messageIdSet = new Set(event.message_ids);
        result = addMessages(result, topicNarrow(new_stream_id, new_topic), event.message_ids);
        result = removeMessages(result, topicNarrow(orig_stream_id, orig_topic), messageIdSet);
        if (new_stream_id !== orig_stream_id) {
          result = addMessages(result, streamNarrow(new_stream_id), event.message_ids);
          result = removeMessages(result, streamNarrow(orig_stream_id), messageIdSet);
        }
      }

      // We don't attempt to update search narrows.

      // The other way editing a message can affect what narrows it falls
      // into is by changing its flags.  Those cause a separate event; see
      // the EVENT_UPDATE_MESSAGE_FLAGS case.

      return result;
    }

    case EVENT_UPDATE_MESSAGE_FLAGS:
      return eventUpdateMessageFlags(state, action);

    default:
      return state;
  }
};
