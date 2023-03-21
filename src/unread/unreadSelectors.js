/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector } from '../types';
import type { UnreadStreamItem } from './UnreadCards';
import { caseInsensitiveCompareFunc } from '../utils/misc';
import { getMute, isTopicVisibleInStream } from '../mute/muteModel';
import { getOwnUserId } from '../users/userSelectors';
import { getSubscriptionsById, getStreamsById } from '../subscriptions/subscriptionSelectors';
import { caseNarrow } from '../utils/narrow';
import {
  getUnread,
  getUnreadPms,
  getUnreadHuddles,
  getUnreadMentions,
  getUnreadStreams,
  getUnreadCountForTopic,
  getUnreadIdsForPmNarrow,
} from './unreadModel';

/** The number of unreads in each stream, excluding muted topics, by stream ID. */
export const getUnreadByStream: Selector<{| [number]: number |}> = createSelector(
  getUnreadStreams,
  getMute,
  (unreadStreams, mute) => {
    const totals = ({}: {| [number]: number |});
    for (const [streamId, streamData] of unreadStreams.entries()) {
      let total = 0;
      for (const [topic, msgIds] of streamData) {
        if (isTopicVisibleInStream(streamId, topic, mute)) {
          total += msgIds.size;
        }
      }
      totals[streamId] = total;
    }
    return totals;
  },
);

/** Total number of unread stream messages -- ??? treatment of muting. */
// TODO: it looks like this excludes muted topics, but *includes* muted streams.
export const getUnreadStreamTotal: Selector<number> = createSelector(
  getUnreadByStream,
  unreadByStream => Object.values(unreadByStream).reduce((total, x) => +x + total, 0),
);

/**
 * The number of unreads in each 1:1 PM thread, by user ID.
 *
 * Just as in the `unread_msgs` data structure, the user used in the key is
 *  * for the self-PM thread, the self user;
 *  * for other 1:1 PM threads, the other user in the thread.
 *
 * See also `getUnreadByHuddles`, for group PM threads.
 */
export const getUnreadByPms: Selector<{| [number]: number |}> = createSelector(
  getUnreadPms,
  unreadPms => {
    const totals = ({}: {| [number]: number |});
    unreadPms.forEach(pm => {
      totals[pm.sender_id] = totals[pm.sender_id] || 0 + pm.unread_message_ids.length;
    });
    return totals;
  },
);

/**
 * Total number of unread 1:1 PMs.
 *
 * See also `getUnreadHuddlesTotal`, for group PMs.
 */
export const getUnreadPmsTotal: Selector<number> = createSelector(getUnreadPms, unreadPms =>
  unreadPms.reduce((total, pm) => total + pm.unread_message_ids.length, 0),
);

/**
 * The number of unreads in each group PM thread.
 *
 * The keys correspond to `user_ids_string` in the `unread_msgs` data
 * structure; see `src/api/initialDataTypes.js`.  In particular they include
 * all users in the thread, including the self user.
 *
 * See also `getUnreadByPms`, for 1:1 PM threads.
 */
export const getUnreadByHuddles: Selector<{| [string]: number |}> = createSelector(
  getUnreadHuddles,
  unreadHuddles => {
    const totals = ({}: {| [string]: number |});
    unreadHuddles.forEach(huddle => {
      totals[huddle.user_ids_string] =
        totals[huddle.user_ids_string] || 0 + huddle.unread_message_ids.length;
    });
    return totals;
  },
);

/**
 * Total number of unread group PMs.
 *
 * See also `getUnreadPmsTotal`, for 1:1 PMs.
 */
export const getUnreadHuddlesTotal: Selector<number> = createSelector(
  getUnreadHuddles,
  unreadHuddles =>
    unreadHuddles.reduce((total, huddle) => total + huddle.unread_message_ids.length, 0),
);

/** Total number of unread @-mentions. */
export const getUnreadMentionsTotal: Selector<number> = createSelector(
  getUnreadMentions,
  unreadMentions => unreadMentions.length,
);

/** Total number of unreads, with ??? caveats. */
// TODO: This appears to double-count @-mentions.  Why not just use `count`
//   from the `unread_msgs` data structure?
// TODO: This seems to include muted streams, though not muted topics;
//   see `getUnreadStreamTotal`.  Looks like this causes #3589.
export const getUnreadTotal: Selector<number> = createSelector(
  getUnreadStreamTotal,
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  (unreadStreamTotal, unreadPmsTotal, unreadHuddlesTotal, mentionsTotal): number =>
    unreadStreamTotal + unreadPmsTotal + unreadHuddlesTotal + mentionsTotal,
);

/**
 * Summary of unread unmuted stream messages, to feed to the unreads screen.
 *
 * The exact collection of data included here is just an assortment of what
 * the unreads screen happens to need.
 *
 * Each stream with unmuted unreads appears as an element of the array, and
 * contains in `.data` an array with an element for each unmuted topic that
 * has unreads.
 */
export const getUnreadStreamsAndTopics: Selector<$ReadOnlyArray<UnreadStreamItem>> = createSelector(
  getSubscriptionsById,
  getUnreadStreams,
  getMute,
  getUnreadMentions,
  (subscriptionsById, unreadStreams, mute, unreadMentions) => {
    const result = [];
    const unreadMsgIds = new Set(unreadMentions);
    for (const [streamId, streamData] of unreadStreams.entries()) {
      const subscription = subscriptionsById.get(streamId);
      if (!subscription) {
        // We have a loose invariant that you can't have unreads in a stream
        // you're not subscribed to.  It's "loose" because when you unsubscribe
        // from a stream you had unreads in, the server only asynchronously
        // marks them as read:
        //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/unreads.20in.20unsubscribed.20streams/near/1456534
        // In the UI, though, we generally want to fix things up so that
        // it's as if the invariant were a real invariant.  So if we find
        // some supposed "unreads" in a stream with no subscription,
        // avert our eyes; those "unread" records don't count.
        continue;
      }

      const { name, color, in_home_view, invite_only, pin_to_top, is_web_public } = subscription;

      if (!in_home_view) {
        continue;
      }

      let totalUnread = 0;
      const topics = [];
      for (const [topic, msgIds] of streamData) {
        if (!isTopicVisibleInStream(streamId, topic, mute)) {
          continue;
        }
        totalUnread += msgIds.size;
        const isMentioned = msgIds.some(id => unreadMsgIds.has(id));
        topics.push({
          key: topic,
          topic,
          unread: msgIds.size,
          isMentioned,
          lastUnreadMsgId: msgIds.last(),
        });
      }
      if (topics.length === 0) {
        continue;
      }

      topics.sort((a, b) => b.lastUnreadMsgId - a.lastUnreadMsgId);
      result.push({
        key: `stream:${streamId}`,
        streamId,
        streamName: name,
        isPrivate: invite_only,
        isPinned: pin_to_top,
        isWebPublic: is_web_public,
        color,
        unread: totalUnread,
        data: topics,
      });
    }

    result.sort((a, b) => caseInsensitiveCompareFunc(a.streamName, b.streamName));
    result.sort((a, b) => +b.isPinned - +a.isPinned);

    return result;
  },
);

/**
 * Total number of unreads in the given narrow... mostly.
 *
 * For the @-mention narrow, all-PMs narrow, and search narrows,
 * just returns 0.
 *
 * For the all-messages narrow, the caveats on `getUnreadTotal` apply.
 */
export const getUnreadCountForNarrow: Selector<number, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getStreamsById(state),
  state => getOwnUserId(state),
  state => getUnreadTotal(state),
  state => getUnread(state),
  state => getMute(state),
  (narrow, streams, ownUserId, unreadTotal, unread, mute) =>
    caseNarrow(narrow, {
      home: () => unreadTotal,

      stream: streamId =>
        unread.streams
          .get(streamId)
          ?.entrySeq()
          .filter(([topic, _]) => isTopicVisibleInStream(streamId, topic, mute))
          .map(([_, msgIds]) => msgIds.size)
          .reduce((s, x) => s + x, 0) ?? 0,

      topic: (streamId, topic) => getUnreadCountForTopic(unread, streamId, topic),

      pm: _ => getUnreadIdsForPmNarrow(unread, narrow, ownUserId).length,

      // Unread starred messages are impossible, so 0 is correct for the
      // starred-messages narrow.
      // TODO: fact-check that.
      starred: () => 0,

      // TODO: give a correct answer for the @-mentions narrow.
      mentioned: () => 0,

      // For search narrows, shrug, a bogus answer of 0 is fine.
      search: () => 0,

      // For the all-PMs narrow, a bogus answer of 0 is perfectly fine
      // because we never use this selector for that narrow (because we
      // don't expose it as one you can narrow to in the UI.)
      allPrivate: () => 0,
    }),
);
