/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
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

export const getUnreadByStream = createSelector(
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

export const getUnreadStreamTotal = createSelector(getUnreadByStream, unreadByStream =>
  Object.values(unreadByStream).reduce((total, x) => +x + total, 0),
);

export const getUnreadByPms = createSelector(getUnreadPms, unreadPms =>
  unreadPms.reduce((totals, pm) => {
    totals[pm.sender_id] = totals[pm.sender_id] || 0 + pm.unread_message_ids.length;
    return totals;
  }, ({}: { [number]: number })),
);

export const getUnreadPmsTotal = createSelector(getUnreadPms, unreadPms =>
  unreadPms.reduce((total, pm) => total + pm.unread_message_ids.length, 0),
);

export const getUnreadByHuddles = createSelector(getUnreadHuddles, unreadHuddles =>
  unreadHuddles.reduce((totals, huddle) => {
    totals[huddle.user_ids_string] =
      totals[huddle.user_ids_string] || 0 + huddle.unread_message_ids.length;
    return totals;
  }, ({}: { [string]: number })),
);

export const getUnreadHuddlesTotal = createSelector(getUnreadHuddles, unreadHuddles =>
  unreadHuddles.reduce((total, huddle) => total + huddle.unread_message_ids.length, 0),
);

export const getUnreadMentionsTotal = createSelector(
  getUnreadMentions,
  unreadMentions => unreadMentions.length,
);

export const getUnreadTotal = createSelector(
  getUnreadStreamTotal,
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  (unreadStreamTotal, unreadPmsTotal, unreadHuddlesTotal, mentionsTotal): number =>
    unreadStreamTotal + unreadPmsTotal + unreadHuddlesTotal + mentionsTotal,
);

type UnreadTopic = {|
  key: string,
  topic: string,
  unread: number,
  lastUnreadMsgId: number,
|};

type UnreadStream = {|
  key: string,
  streamName: string,
  color: string,
  unread: number,
  data: Array<UnreadTopic>,
|};

export const getUnreadStreamsAndTopics = createSelector(
  getSubscriptionsById,
  getUnreadStreams,
  getMute,
  (subscriptionsById, unreadStreams, mute) => {
    const unreadMap = unreadStreams.reduce((totals, stream) => {
      const { name, color, in_home_view, invite_only, pin_to_top } =
        subscriptionsById[stream.stream_id] || NULL_SUBSCRIPTION;

      if (!totals[stream.stream_id]) {
        totals[stream.stream_id] = {
          key: name,
          streamName: name,
          isMuted: !in_home_view,
          isPrivate: invite_only,
          isPinned: pin_to_top,
          color,
          unread: 0,
          data: [],
        };
      }

      const isMuted = !mute.every(x => x[0] !== name || x[1] !== stream.topic);
      if (!isMuted) {
        totals[stream.stream_id].unread += stream.unread_message_ids.length;
      }

      totals[stream.stream_id].data.push({
        key: stream.topic,
        topic: stream.topic,
        unread: stream.unread_message_ids.length,
        lastUnreadMsgId: stream.unread_message_ids[stream.unread_message_ids.length - 1],
        isMuted,
      });

      return totals;
    }, {});

    const sortedStreams = Object.values(unreadMap)
      .sort((a: any, b: any) => caseInsensitiveCompareFunc(a.streamName, b.streamName))
      .sort((a: any, b: any): number => +b.isPinned - +a.isPinned);

    // $FlowFixMe
    sortedStreams.forEach((stream: UnreadStream) => {
      stream.data.sort((a, b) => b.lastUnreadMsgId - a.lastUnreadMsgId);
    });

    return sortedStreams;
  },
);

export const getUnreadStreamsAndTopicsSansMuted = createSelector(
  getUnreadStreamsAndTopics,
  unreadStreamsAndTopics =>
    unreadStreamsAndTopics
      .map(stream => ({
        ...stream,
        data: stream.data.filter(topic => !topic.isMuted),
      }))
      .filter(stream => !stream.isMuted && stream.data.length > 0),
);

export const getUnreadPrivateMessagesCount = createSelector(
  getPrivateMessages,
  getReadFlags,
  (privateMessages, readFlags) => countUnread(privateMessages.map(msg => msg.id), readFlags),
);

export const getUnreadByHuddlesMentionsAndPMs = createSelector(
  getUnreadPmsTotal,
  getUnreadHuddlesTotal,
  getUnreadMentionsTotal,
  (unreadPms, unreadHuddles, unreadMentions) => unreadPms + unreadHuddles + unreadMentions,
);

export const getUnreadCountForNarrow = (narrow: Narrow) =>
  createSelector(
    getStreams,
    getAllUsersByEmail,
    getOwnEmail,
    getUnreadTotal,
    getUnreadStreams,
    getUnreadHuddles,
    getUnreadPms,
    getMute,
    (
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
          .map(email => (usersByEmail[email] || NULL_USER).user_id)
          .sort((a, b) => a - b)
          .join(',');
        const unread = unreadHuddles.find(x => x.user_ids_string === userIds);
        return unread ? unread.unread_message_ids.length : 0;
      }

      if (isPrivateNarrow(narrow)) {
        const sender = usersByEmail[narrow[0].operand];
        if (!sender) {
          return 0;
        }
        const unread = unreadPms.find(x => x.sender_id === sender.user_id);
        return unread ? unread.unread_message_ids.length : 0;
      }

      return 0;
    },
  );
