/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { caseInsensitiveCompareObjFunc } from '../utils/misc';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import { getMute } from '../baseSelectors';
import { NULL_SUBSCRIPTION } from '../nullObjects';

export const getUnreadStreams = (state: GlobalState): Object[] => state.unread.streams;
export const getUnreadPms = (state: GlobalState): Object[] => state.unread.pms;
export const getUnreadHuddles = (state: GlobalState): Object[] => state.unread.huddles;
export const getUnreadMentions = (state: GlobalState): number[] => state.unread.mentions;

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

export const getUnreadPmsTotal = createSelector(getUnreadPms, unreadStreams =>
  unreadStreams.reduce((total, stream) => total + stream.unread_message_ids.length, 0),
);

export const getUnreadByHuddles = createSelector(getUnreadHuddles, unreadHuddles =>
  unreadHuddles.reduce((totals, huddle) => {
    totals[huddle.user_ids_string] =
      totals[huddle.user_ids_string] || 0 + huddle.unread_message_ids.length;
    return totals;
  }, {}),
);

export const getUnreadHuddlesTotal = createSelector(getUnreadHuddles, unreadStreams =>
  unreadStreams.reduce((total, stream) => total + stream.unread_message_ids.length, 0),
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
      const { name, color, in_home_view } =
        subscriptionsById[stream.stream_id] || NULL_SUBSCRIPTION;

      if (!totals[stream.stream_id]) {
        totals[stream.stream_id] = {
          key: name,
          streamName: name,
          isMuted: !in_home_view, // eslint-disable-line
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
