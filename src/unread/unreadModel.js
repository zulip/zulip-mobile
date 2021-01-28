/* @flow strict-local */
import Immutable from 'immutable';

import type { Action } from '../actionTypes';
import type {
  UnreadState,
  UnreadStreamsState,
  UnreadPmsState,
  UnreadHuddlesState,
  UnreadMentionsState,
} from './unreadModelTypes';
import type { GlobalState } from '../reduxTypes';
import unreadPmsReducer from './unreadPmsReducer';
import unreadHuddlesReducer from './unreadHuddlesReducer';
import unreadMentionsReducer from './unreadMentionsReducer';
import {
  ACCOUNT_SWITCH,
  EVENT_MESSAGE_DELETE,
  EVENT_NEW_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  LOGOUT,
  MESSAGE_FETCH_COMPLETE,
  REALM_INIT,
} from '../actionConstants';
import { getOwnUserId } from '../users/userSelectors';

//
//
// Selectors.
//

export const getUnreadStreams = (state: GlobalState): UnreadStreamsState => state.unread.streams;

export const getUnreadPms = (state: GlobalState): UnreadPmsState => state.unread.pms;

export const getUnreadHuddles = (state: GlobalState): UnreadHuddlesState => state.unread.huddles;

export const getUnreadMentions = (state: GlobalState): UnreadMentionsState => state.unread.mentions;

//
//
// Reducer.
//

const initialStreamsState: UnreadStreamsState = Immutable.Map();

// Like `Immutable.Map#update`, but prune returned values equal to `zero`.
function updateAndPrune<K, V>(
  map: Immutable.Map<K, V>,
  zero: V,
  key: K,
  updater: (V | void) => V,
): Immutable.Map<K, V> {
  const value = map.get(key);
  const newValue = updater(value);
  if (newValue === zero) {
    return map.delete(key);
  }
  if (newValue === value) {
    return map;
  }
  return map.set(key, newValue);
}

/**
 * Remove the given values from the list.
 *
 * This is equivalent to
 *   list_.filter(x => toDelete.indexOf(x) < 0)
 * but more efficient.
 *
 * Specifically, for n items in the list and k to delete, this takes time
 * O(n log n) in the worst case.
 *
 * In the case where the items to delete all appear at the beginning of the
 * list, and in the same order, it takes time O(k log n).  (This is the
 * common case when marking messages as read, which motivates this
 * optimization.)
 */
// In principle this should be doable in time O(k + log n) in the
// all-at-start case.  We'd need the iterator on Immutable.List to support
// iterating through the first k elements in O(k + log n) time.  It seems
// like it should be able to do that, but the current implementation (as of
// Immutable 4.0.0-rc.12) takes time O(k log n): each step of the iterator
// passes through a stack of log(n) helper functions.  Ah well.
//
// The logs are base 32, so in practice our log(n) is never more than 3
// (which would be enough for 32**3 = 32768 items), usually at most 2
// (enough for 1024 items); and for the messages in one conversation, very
// commonly 1, i.e. there are commonly just ≤32 messages.  So the difference
// between O(k log n) and O(k + log n) might be noticeable but is unlikely
// to be catastrophic.
function deleteFromList<V>(
  list_: Immutable.List<V>,
  toDelete_: Immutable.List<V>,
): Immutable.List<V> {
  // Alias the parameters because Flow doesn't accept mutating them.
  let list = list_;
  let toDelete = toDelete_;

  // First, see if some items to delete happen to be at the start, and
  // remove those.  This is the common case for marking messages as read,
  // so it's worth some effort to optimize.  And we can do it efficiently:
  // for deleting the first k out of n messages, we take time O(k log n)
  // rather than O(n).

  const minSize = Math.min(list.size, toDelete.size);
  let i = 0;
  for (; i < minSize; i++) {
    // This loop takes time O(log n) per iteration, O(k log n) total.
    if (list.get(i) !== toDelete.get(i)) {
      break;
    }
  }

  if (i > 0) {
    // This takes time O(log n).
    list = list.slice(i);
    // This takes time O(log k) ≤ O(log n).
    toDelete = toDelete.slice(i);
  }

  // That might have been all the items we wanted to delete.
  // In fact that's the most common case when marking items as read.
  if (toDelete.isEmpty()) {
    return list;
  }

  // It wasn't; we have more to delete.  We'll have to find them in the
  // middle of the list and delete them wherever they are.
  //
  // This takes time O(n log n), probably (though an ideal implementation of
  // Immutable should be able to make it O(n).)
  const toDeleteSet = new Set(toDelete);
  return list.filterNot(id => toDeleteSet.has(id));
}

const emptyList = Immutable.List();

/**
 * Remove the given values, given where to find them; and prune.
 *
 * That is, for each entry in `toDelete`, we apply `deleteFromList` with the
 * given list to the corresponding entry in `state`.  When the resulting
 * list is empty, we prune that entry entirely.
 */
function deleteFromListMap<K, V>(
  state: Immutable.Map<K, Immutable.List<V>>,
  toDelete: Immutable.Map<K, Immutable.List<V>>,
): Immutable.Map<K, Immutable.List<V>> {
  // prettier-ignore
  return state.withMutations(mut => {
    toDelete.forEach((msgIds, key) => {
      updateAndPrune(mut, emptyList, key, list =>
        list && deleteFromList(list, msgIds));
    });
  });
}

/**
 * Delete the given messages from the unreads state.
 *
 * Relies on `globalMessages` to look up exactly where in the unreads data
 * structure the messages are expected to appear.
 *
 * This is efficient at deleting some messages even when the total number of
 * existing messages is much larger.  Specifically the time spent should be
 * O(N' log n + c log C), where the messages to delete appear in c out of a
 * total of C conversations, and the affected conversations have a total of
 * N' messages and at most n in any one conversation.  If the messages to be
 * deleted are all at the start of the list for their respective
 * conversations the time should be O(k log n + c log C), where there are
 * k messages to delete.
 *
 * For the common case of marking some messages as read, we expect that all
 * the affected messages will indeed be at the start of their respective
 * conversations, and the number c of affected conversations will be small,
 * typically 1.  (It could be more than 1 if reading a stream narrow, or
 * other interleaved narrow.)
 */
function deleteMessages(
  state: UnreadStreamsState,
  ids: $ReadOnlyArray<number>,
  globalMessages,
): UnreadStreamsState {
  const byConversation =
    // prettier-ignore
    (Immutable.Map(): Immutable.Map<number, Immutable.Map<string, Immutable.List<number>>>)
    .withMutations(mut => {
      for (const id of ids) {
        const message = globalMessages.get(id);
        if (!message || message.type !== 'stream') {
          continue;
        }
        const { stream_id, subject: topic } = message;
        mut.updateIn([stream_id, topic], (l = Immutable.List()) => l.push(id));
      }
    });

  const emptyMap = Immutable.Map();
  // prettier-ignore
  return state.withMutations(stateMut => {
    byConversation.forEach((byTopic, streamId) => {
      updateAndPrune(stateMut, emptyMap, streamId, perStream =>
        perStream && deleteFromListMap(perStream, byTopic),
      );
    });
  });
}

function streamsReducer(
  state: UnreadStreamsState = initialStreamsState,
  action: Action,
  globalState: GlobalState,
): UnreadStreamsState {
  switch (action.type) {
    case LOGOUT:
    case ACCOUNT_SWITCH:
      // TODO(#4446) also LOGIN_SUCCESS, presumably
      return initialStreamsState;

    case REALM_INIT: {
      // This may indeed be unnecessary, but it's legacy; have not investigated
      // if it's this bit of our API types that is too optimistic.
      // flowlint-next-line unnecessary-optional-chain:off
      const data = action.data.unread_msgs?.streams ?? [];

      // First, collect together all the data for a given stream, just in a
      // plain old Array.
      const byStream = new Map();
      for (const { stream_id, topic, unread_message_ids } of data) {
        let perStream = byStream.get(stream_id);
        if (!perStream) {
          perStream = [];
          byStream.set(stream_id, perStream);
        }
        // unread_message_ids is already sorted; see comment at its
        // definition in src/api/initialDataTypes.js.
        perStream.push([topic, Immutable.List(unread_message_ids)]);
      }

      // Then, for each of those plain Arrays build an Immutable.Map from it
      // all in one shot.  This is quite a bit faster than building the Maps
      // incrementally.  For a user with lots of unreads in a busy org, we
      // can be handling 50k message IDs here, across perhaps 2-5k threads
      // in dozens of streams, so the effect is significant.
      return Immutable.Map(Immutable.Seq.Keyed(byStream.entries()).map(Immutable.Map));
    }

    case MESSAGE_FETCH_COMPLETE:
      // TODO handle MESSAGE_FETCH_COMPLETE here.  This rarely matters, but
      //   could in principle: we could be fetching some messages from
      //   before the (long) window included in the initial unreads data.
      //   For comparison, the webapp does handle this case; see the call to
      //   message_util.do_unread_count_updates in message_fetch.js.
      return state;

    case EVENT_NEW_MESSAGE: {
      const { message } = action;
      if (message.type !== 'stream') {
        return state;
      }

      if (message.sender_id === getOwnUserId(globalState)) {
        return state;
      }

      // prettier-ignore
      return state.updateIn([message.stream_id, message.subject],
        (perTopic = Immutable.List()) => perTopic.push(message.id));
    }

    case EVENT_MESSAGE_DELETE:
      return deleteMessages(state, action.messageIds, globalState.messages);

    case EVENT_UPDATE_MESSAGE_FLAGS: {
      if (action.flag !== 'read') {
        return state;
      }

      if (action.all) {
        return initialStreamsState;
      }

      if (action.operation === 'remove') {
        // Zulip doesn't support un-reading a message.  Ignore it.
        return state;
      }

      return deleteMessages(state, action.messages, globalState.messages);
    }

    default:
      return state;
  }
}

export const reducer = (
  state: void | UnreadState,
  action: Action,
  globalState: GlobalState,
): UnreadState => {
  const nextState = {
    streams: streamsReducer(state?.streams, action, globalState),

    // Note for converting these other sub-reducers to the new design:
    // Probably first push this four-part data structure down through the
    // `switch` statement, and the other logic that's duplicated between them.
    pms: unreadPmsReducer(state?.pms, action),
    huddles: unreadHuddlesReducer(state?.huddles, action),
    mentions: unreadMentionsReducer(state?.mentions, action),
  };

  if (state && Object.keys(nextState).every(key => nextState[key] === state[key])) {
    return state;
  }

  return nextState;
};
