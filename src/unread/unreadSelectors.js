/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, UnreadStreamItem } from '../types';
import { caseInsensitiveCompareFunc } from '../utils/misc';
import {
  getMute,
  getReadFlags,
  getStreams,
  getUnreadStreams,
  getUnreadPms,
  getUnreadHuddles,
  getUnreadMentions,
} from '../directSelectors';
import { getOwnEmail } from '../account/accountsSelectors';
import { getPrivateMessages } from '../message/messageSelectors';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import { countUnread } from '../utils/unread';
import { isTopicMuted } from '../utils/message';
import {
  isHomeNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isGroupNarrow,
  isPrivateNarrow,
} from '../utils/narrow';
import { NULL_SUBSCRIPTION, NULL_USER } from '../nullObjects';
import { getAllUsersByEmail } from '../users/userSelectors';

export const getUnreadByStream: Selector<{ [number]: number }> = createSelector(
  getUnreadStreams,
  getSubscriptionsById,
  getMute,
  (unreadStreams, subscriptionsById, mute) =>
    unreadStreams.reduce((totals, stream) => {
      if (!totals[stream.stream_id]) {
        totals[stream.stream_id] = 0;
      }
      const isMuted = isTopicMuted(
        (subscriptionsById[stream.stream_id] || NULL_SUBSCRIPTION).name,
        stream.topic,
        mute,
      );
      totals[stream.stream_id] += isMuted ? 0 : stream.unread_message_ids.length;
      return totals;
    }, ({}: { [number]: number })),
);

export const getUnreadStreamTotal: Selector<number> = createSelector(
  getUnreadByStream,
  unreadByStream => Object.values(unreadByStream).reduce((total, x) => +x + total, 0),
);

export const getUnreadByPms: Selector<{ [number]: number }> = createSelector(
  getUnreadPms,
  unreadPms =>
    unreadPms.reduce((totals, pm) => {
      totals[pm.sender_id] = totals[pm.sender_id] || 0 + pm.unread_message_ids.length;
      return totals;
    }, ({}: { [number]: number })),
);

export const getUnreadPmsTotal: Selector<number> = createSelector(getUnreadPms, unreadPms =>
  unreadPms.reduce((total, pm) => total + pm.unread_message_ids.length, 0),
);

export const getUnreadByHuddles: Selector<{ [string]: number }> = createSelector(
  getUnreadHuddles,
  unreadHuddles =>
    unreadHuddles.reduce((totals, huddle) => {
      totals[huddle.user_ids_string] =
        totals[huddle.user_ids_string] || 0 + huddle.unread_message_ids.length;
      return totals;
    }, ({}: { [string]: number })),
);

export const getUnreadHuddlesTotal: Selector<number> = createSelector(
  getUnreadHuddles,
  unreadHuddles =>
    unreadHuddles.reduce((total, huddle) => total + huddle.unread_message_ids.length, 0),
);

export const getUnreadMentionsTotal: Selector<number> = createSelector(
  getUnreadMentions,
  unreadMentions => unreadMentions.length,
);

export const getUnreadTotal: Selector<number> = createSelector(
  getUnreadStreamTotal,
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  (unreadStreamTotal, unreadPmsTotal, unreadHuddlesTotal, mentionsTotal): number =>
    unreadStreamTotal + unreadPmsTotal + unreadHuddlesTotal + mentionsTotal,
);

export const getUnreadStreamsAndTopics: Selector<UnreadStreamItem[]> = createSelector(
  getSubscriptionsById,
  getUnreadStreams,
  getMute,
  (subscriptionsById, unreadStreams, mute) => {
    const totals = new Map();
    unreadStreams.forEach(stream => {
      const { name, color, in_home_view, invite_only, pin_to_top } =
        subscriptionsById[stream.stream_id] || NULL_SUBSCRIPTION;

      let total = totals.get(stream.stream_id);
      if (!total) {
        total = {
          key: name,
          streamName: name,
          isMuted: !in_home_view,
          isPrivate: invite_only,
          isPinned: pin_to_top,
          color,
          unread: 0,
          data: [],
        };
        totals.set(stream.stream_id, total);
      }

      const isMuted = !mute.every(x => x[0] !== name || x[1] !== stream.topic);
      if (!isMuted) {
        total.unread += stream.unread_message_ids.length;
      }

      total.data.push({
        key: stream.topic,
        topic: stream.topic,
        unread: stream.unread_message_ids.length,
        lastUnreadMsgId: stream.unread_message_ids[stream.unread_message_ids.length - 1],
        isMuted,
      });
    });

    const sortedStreams = Array.from(totals.values())
      .sort((a, b) => caseInsensitiveCompareFunc(a.streamName, b.streamName))
      .sort((a, b) => +b.isPinned - +a.isPinned);

    sortedStreams.forEach(stream => {
      stream.data.sort((a, b) => b.lastUnreadMsgId - a.lastUnreadMsgId);
    });

    return sortedStreams;
  },
);

export const getUnreadStreamsAndTopicsSansMuted: Selector<UnreadStreamItem[]> = createSelector(
  getUnreadStreamsAndTopics,
  unreadStreamsAndTopics =>
    unreadStreamsAndTopics
      .map(stream => ({
        ...stream,
        data: stream.data.filter(topic => !topic.isMuted),
      }))
      .filter(stream => !stream.isMuted && stream.data.length > 0),
);

export const getUnreadPrivateMessagesCount: Selector<number> = createSelector(
  getPrivateMessages,
  getReadFlags,
  (privateMessages, readFlags) => countUnread(privateMessages.map(msg => msg.id), readFlags),
);

export const getUnreadByHuddlesMentionsAndPMs: Selector<number> = createSelector(
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  (unreadPms, unreadHuddles, unreadMentions) => unreadPms + unreadHuddles + unreadMentions,
);

export const getUnreadCountForNarrow: Selector<number, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getStreams(state),
  state => getAllUsersByEmail(state),
  state => getOwnEmail(state),
  state => getUnreadTotal(state),
  state => getUnreadStreams(state),
  state => getUnreadHuddles(state),
  state => getUnreadPms(state),
  state => getMute(state),
  (
    narrow,
    streams,
    usersByEmail,
    ownEmail,
    unreadTotal,
    unreadStreams,
    unreadHuddles,
    unreadPms,
    mute,
  ) => {
    if (isHomeNarrow(narrow)) {
      return unreadTotal;
    }

    if (isStreamNarrow(narrow)) {
      const stream = streams.find(s => s.name === narrow[0].operand);

      if (!stream) {
        return 0;
      }

      return unreadStreams
        .filter(x => x.stream_id === stream.stream_id)
        .reduce(
          (sum, x) =>
            sum + (isTopicMuted(stream.name, x.topic, mute) ? 0 : x.unread_message_ids.length),
          0,
        );
    }

    if (isTopicNarrow(narrow)) {
      const stream = streams.find(s => s.name === narrow[0].operand);

      if (!stream) {
        return 0;
      }

      return unreadStreams
        .filter(x => x.stream_id === stream.stream_id && x.topic === narrow[1].operand)
        .reduce((sum, x) => sum + x.unread_message_ids.length, 0);
    }

    if (isGroupNarrow(narrow)) {
      const userIds = [...narrow[0].operand.split(','), ownEmail]
        .map(email => (usersByEmail.get(email) || NULL_USER).user_id)
        .sort((a, b) => a - b)
        .join(',');
      const unread = unreadHuddles.find(x => x.user_ids_string === userIds);
      return unread ? unread.unread_message_ids.length : 0;
    }

    if (isPrivateNarrow(narrow)) {
      const sender = usersByEmail.get(narrow[0].operand);
      if (!sender) {
        return 0;
      }
      const unread = unreadPms.find(x => x.sender_id === sender.user_id);
      return unread ? unread.unread_message_ids.length : 0;
    }

    return 0;
  },
);
