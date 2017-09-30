/* @flow */
import { createSelector } from 'reselect';

import { caseInsensitiveCompareObjFunc } from '../utils/misc';
import {
  getActiveNarrow,
  getMute,
  getReadFlags,
  getStreams,
  getUsers,
  getUnreadStreams,
  getUnreadPms,
  getUnreadHuddles,
  getUnreadMentions,
} from '../directSelectors';
import { getOwnEmail } from '../account/accountSelectors';
import { getPrivateMessages } from '../baseSelectors';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import { countUnread } from '../utils/unread';
import {
  isHomeNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isGroupNarrow,
  isPrivateNarrow,
} from '../utils/narrow';
import { NULL_SUBSCRIPTION } from '../nullObjects';

export const getUnreadByStream = createSelector(getUnreadStreams, unreadStreams =>
  unreadStreams.reduce((totals, stream) => {
    totals[stream.stream_id] = (totals[stream.stream_id] || 0) + stream.unread_message_ids.length;
    return totals;
  }, {}),
);

export const getUnreadStreamTotal = createSelector(getUnreadStreams, unreadStreams =>
  unreadStreams.reduce((total, stream) => total + stream.unread_message_ids.length, 0),
);

export const getUnreadByPms = createSelector(getUnreadPms, unreadPms =>
  unreadPms.reduce((totals, pm) => {
    totals[pm.sender_id] = totals[pm.sender_id] || 0 + pm.unread_message_ids.length;
    return totals;
  }, {}),
);

export const getUnreadPmsTotal = createSelector(getUnreadPms, unreadPms =>
  unreadPms.reduce((total, pm) => total + pm.unread_message_ids.length, 0),
);

export const getUnreadByHuddles = createSelector(getUnreadHuddles, unreadHuddles =>
  unreadHuddles.reduce((totals, huddle) => {
    totals[huddle.user_ids_string] =
      totals[huddle.user_ids_string] || 0 + huddle.unread_message_ids.length;
    return totals;
  }, {}),
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
  (unreadStreamTotal, unreadPmsTotal, unreadHuddlesTotal, mentionsTotal) =>
    unreadStreamTotal + unreadPmsTotal + unreadHuddlesTotal + mentionsTotal,
);

type UnreadTopic = {
  key: string,
  topic: string,
  unread: number,
};

type UnreadStream = {
  key: string,
  streamName: string,
  color: string,
  unread: number,
  data: Array<UnreadTopic>,
};

export const getUnreadStreamsAndTopics = createSelector(
  getSubscriptionsById,
  getUnreadStreams,
  getMute,
  (subscriptionsById, unreadStreams, mute) => {
    const unreadMap = unreadStreams.reduce((totals, stream) => {
      const { name, color, in_home_view, invite_only } =
        subscriptionsById[stream.stream_id] || NULL_SUBSCRIPTION;

      if (!totals[stream.stream_id]) {
        totals[stream.stream_id] = {
          key: name,
          streamName: name,
          isMuted: !in_home_view, // eslint-disable-line
          isPrivate: invite_only,
          color,
          unread: 0,
          data: [],
        };
      }

      totals[stream.stream_id].unread += stream.unread_message_ids.length;
      totals[stream.stream_id].data.push({
        key: stream.topic,
        topic: stream.topic,
        unread: stream.unread_message_ids.length,
        isMuted: !mute.every(x => x[0] !== name || x[1] !== stream.topic),
      });

      return totals;
    }, {});

    const sortedStreams = Object.values(unreadMap).sort(
      caseInsensitiveCompareObjFunc('streamName'),
    );

    // $FlowFixMe
    sortedStreams.forEach((stream: UnreadStream) => {
      stream.data.sort(caseInsensitiveCompareObjFunc('topic'));
    });

    return sortedStreams;
  },
);

export const getUnreadPrivateMessagesCount = createSelector(
  getPrivateMessages,
  getReadFlags,
  (privateMessages, readFlags) => countUnread(privateMessages.map(msg => msg.id), readFlags),
);

export const getUnreadCountInActiveNarrow = createSelector(
  getActiveNarrow,
  getStreams,
  getUsers,
  getOwnEmail,
  getUnreadTotal,
  getUnreadStreams,
  getUnreadHuddles,
  getUnreadPms,
  (narrow, streams, users, ownEmail, unreadTotal, unreadStreams, unreadHuddles, unreadPms) => {
    if (isHomeNarrow(narrow)) {
      return unreadTotal;
    }

    if (isStreamNarrow(narrow)) {
      const streamId = streams.find(stream => stream.name === narrow[0].operand).stream_id;
      return unreadStreams
        .filter(x => x.stream_id === streamId)
        .reduce((sum, x) => sum + x.unread_message_ids.length, 0);
    }

    if (isTopicNarrow(narrow)) {
      const streamId = streams.find(stream => stream.name === narrow[0].operand).stream_id;
      return unreadStreams
        .filter(x => x.stream_id === streamId && x.topic === narrow[1].operand)
        .reduce((sum, x) => sum + x.unread_message_ids.length, 0);
    }

    if (isGroupNarrow(narrow)) {
      const userIds = [...narrow[0].operand.split(','), ownEmail]
        .map(email => users.find(user => user.email === email).id)
        .sort((a, b) => a - b)
        .join(',');
      const unread = unreadHuddles.find(x => x.user_ids_string === userIds);
      return unread ? unread.unread_message_ids.length : 0;
    }

    if (isPrivateNarrow(narrow)) {
      const senderId = users.find(user => user.email === narrow[0].operand).id;
      const unread = unreadPms.find(x => x.sender_id === senderId);
      return unread ? unread.unread_message_ids.length : 0;
    }

    return 0;
  },
);
