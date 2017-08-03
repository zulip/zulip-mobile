/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
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

export const getUnreadStreamsAndTopics = createSelector(
  getSubscriptionsById,
  getUnreadStreams,
  (subscriptionsById, unreadStreams) =>
    Object.values(
      unreadStreams.reduce((totals, stream) => {
        const { name, color } = subscriptionsById[stream.stream_id] || NULL_SUBSCRIPTION;

        if (!totals[stream.stream_id]) {
          totals[stream.stream_id] = {
            key: name,
            streamName: name,
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
        });

        return totals;
      }, {}),
    ),
);
