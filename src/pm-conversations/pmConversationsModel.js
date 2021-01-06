/* @flow strict-local */
import Immutable from 'immutable';
import invariant from 'invariant';
import {
  ACCOUNT_SWITCH,
  EVENT_NEW_MESSAGE,
  LOGIN_SUCCESS,
  LOGOUT,
  MESSAGE_FETCH_COMPLETE,
  REALM_INIT,
} from '../actionConstants';

import type { Action, Message, Outbox } from '../types';
import { recipientsOfPrivateMessage } from '../utils/recipient';
import { ZulipVersion } from '../utils/zulipVersion';

/** The minimum server version to expect this data to be available. */
// Actually 2.1-dev-384-g4c3c669b41 according to our notes in src/api/;
// but this is cleaner, and 2.1 is out long enough that few people, if any,
// will be running a 2.1-dev version anymore (and nobody should be.)
// TODO(server-2.1): Delete this and all code conditioned on older than it.
export const MIN_RECENTPMS_SERVER_VERSION = new ZulipVersion('2.1');

//
//
// Keys.
//

/** The key identifying a PM conversation in this data structure. */
// User IDs, excluding self, sorted numerically, joined with commas.
export opaque type PmConversationKey = string;

/** PRIVATE.  Exported only for tests. */
// Input must have the exact right (multi-)set of users.  Needn't be sorted.
export function keyOfExactUsers(ids: number[]): PmConversationKey {
  return ids.sort((a, b) => a - b).join(',');
}

// Input may contain self or not, and needn't be sorted.
function keyOfUsers(ids: number[], ownUserId: number): PmConversationKey {
  return keyOfExactUsers(ids.filter(id => id !== ownUserId));
}

// Input must indeed be a PM, else throws.
function keyOfPrivateMessage(msg: Message | Outbox, ownUserId: number): PmConversationKey {
  return keyOfUsers(recipientsOfPrivateMessage(msg).map(r => r.id), ownUserId);
}

/** The users in the conversation, other than self. */
export function usersOfKey(key: PmConversationKey): number[] {
  return key ? key.split(',').map(s => Number.parseInt(s, 10)) : [];
}

//
//
// State and reducer.
//

/**
 * The list of recent PM conversations, plus data to efficiently maintain it.
 *
 * This gets initialized from the `recent_private_conversations` data
 * structure in the `/register` response (aka our initial fetch), and then
 * kept up to date as we learn about new or newly-fetched messages.
 */
// (Compare the webapp's implementation, in static/js/pm_conversations.js.)
export type PmConversationsState = {|
  // The latest message ID in each conversation.
  map: Immutable.Map<PmConversationKey, number>,

  // The keys of the map, sorted by latest message descending.
  sorted: Immutable.List<PmConversationKey>,
|};

const initialState: PmConversationsState = { map: Immutable.Map(), sorted: Immutable.List() };

// Insert the key at the proper place in the sorted list.
//
// Optimized, taking O(1) time, for the case where that place is the start,
// because that's the common case for a new message.  May take O(n) time in
// general.
function insertSorted(sorted, map, key, msgId) {
  const i = sorted.findIndex(k => {
    const id = map.get(k);
    invariant(id !== undefined, 'pm-conversations: key in sorted should be in map');
    return id < msgId;
  });

  // Immutable.List is a deque, with O(1) shift/unshift as well as push/pop.
  if (i === 0) {
    return sorted.unshift(key);
  }
  if (i < 0) {
    // (This case isn't common and isn't here to optimize, though it happens
    // to be fast; it's just that `sorted.insert(-1, key)` wouldn't work.)
    return sorted.push(key);
  }
  return sorted.insert(i, key);
}

// Insert the message into the state.
//
// Can take linear time in general.  That sounds inefficient...
// but it's what the webapp does, so must not be catastrophic. 🤷
// (In fact the webapp calls `Array#sort`, which takes at *least*
// linear time, and may be 𝛳(N log N).)
//
// Optimized for the EVENT_NEW_MESSAGE case; for REALM_INIT and
// FETCH_MESSAGES_COMPLETE, if we find we want to optimize them, the first
// thing we'll want to do is probably to batch the work and skip this
// function.
//
// For EVENT_NEW_MESSAGE, the point of the event is that we're learning
// about the message in real time immediately after it was sent -- so the
// overwhelmingly common case is that the message is newer than any existing
// message we know about. (*)  That's therefore the case we optimize for,
// particularly in the helper `insertSorted`.
//
// (*) The alternative is possible, but requires some kind of race to occur;
// e.g., we get a FETCH_MESSAGES_COMPLETE that includes the just-sent
// message 1002, and only after that get the event about message 1001, sent
// moments earlier.  The event queue always delivers events in order, so
// even the race is possible only because we fetch messages outside of the
// event queue.
function insert(
  state: PmConversationsState,
  key: PmConversationKey,
  msgId: number,
): PmConversationsState {
  /* eslint-disable padded-blocks */
  let { map, sorted } = state;
  const prev = map.get(key);
  // prettier-ignore
  if (prev === undefined) {
    // The conversation is new.  Add to both `map` and `sorted`.
    map = map.set(key, msgId);
    return { map, sorted: insertSorted(sorted, map, key, msgId) };

  } else if (prev >= msgId) {
    // The conversation already has a newer message.  Do nothing.
    return state;

  } else {
    // The conversation needs to be (a) updated in `map`...
    map = map.set(key, msgId);

    // ... and (b) moved around in `sorted` to keep the list sorted.
    const i = sorted.indexOf(key);
    invariant(i >= 0, 'pm-conversations: key in map should be in sorted');
    sorted = sorted.delete(i); // linear time, ouch
    return { map, sorted: insertSorted(sorted, map, key, msgId) };
  }
}

// Insert the message into the state.
//
// See `insert` for discussion of the time complexity.
function insertMessage(state, message, ownUserId) {
  if (message.type !== 'private') {
    return state;
  }
  return insert(state, keyOfPrivateMessage(message, ownUserId), message.id);
}

export function reducer(state: PmConversationsState = initialState, action: Action) {
  switch (action.type) {
    case LOGOUT:
    case LOGIN_SUCCESS:
    case ACCOUNT_SWITCH:
      return initialState;

    case REALM_INIT: {
      // TODO optimize; this is quadratic (but so is the webapp's version?!)
      let st = initialState;
      for (const r of action.data.recent_private_conversations ?? []) {
        st = insert(st, keyOfExactUsers(r.user_ids), r.max_message_id);
      }
      return st;
    }

    case MESSAGE_FETCH_COMPLETE: {
      // TODO optimize; this is quadratic (but so is the webapp's version?!)
      let st = state;
      for (const m of action.messages) {
        st = insertMessage(st, m, action.ownUserId);
      }
      return st;
    }

    case EVENT_NEW_MESSAGE: {
      const { message, ownUser } = action;
      return insertMessage(state, message, ownUser.user_id);
    }

    default:
      return state;
  }
}
