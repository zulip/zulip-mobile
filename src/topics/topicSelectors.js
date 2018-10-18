/* @flow */
import { createSelector } from 'reselect';

import type { MuteState, Narrow, StreamsState, StreamUnreadItem, TopicsState } from '../types';
import { getMute, getStreams, getTopics, getUnreadStreams } from '../directSelectors';
import { getShownMessagesForNarrow } from '../chat/narrowsSelectors';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow, topicNarrow } from '../utils/narrow';

export const getTopicsForNarrow = (narrow: Narrow) =>
  createSelector(getTopics, getStreams, (topics: TopicsState, streams: StreamsState) => {
    if (!isStreamNarrow(narrow)) {
      return NULL_ARRAY;
    }
    const stream = streams.find(x => x.name === narrow[0].operand);

    if (!stream || !topics[stream.stream_id]) {
      return NULL_ARRAY;
    }

    return topics[stream.stream_id].map(x => x.name);
  });

export const getTopicsForStream = (streamId: number) =>
  createSelector(
    getTopics,
    getMute,
    getStreamsById,
    getUnreadStreams,
    (topics: TopicsState, mute: MuteState, streamsById, unreadStreams: StreamUnreadItem[]) => {
      const topicList = topics[streamId];

      if (!topicList) {
        return undefined;
      }

      const stream = streamsById[streamId];

      return topicList.map(({ name, max_id }) => {
        const isMuted = !!mute.find(x => x[0] === stream.name && x[1] === name);
        const unreadStream = unreadStreams.find(
          x => x.stream_id === stream.stream_id && x.topic === name,
        );
        return {
          name,
          max_id,
          isMuted,
          unreadCount: unreadStream ? unreadStream.unread_message_ids.length : 0,
        };
      });
    },
  );

export const getLastMessageTopic = (narrow: Narrow) =>
  createSelector(
    getShownMessagesForNarrow(narrow),
    messages => (messages.length === 0 ? '' : messages[messages.length - 1].subject),
  );

export const getNarrowToSendTo = (narrow: Narrow) =>
  createSelector(
    getLastMessageTopic(narrow),
    lastTopic => (isStreamNarrow(narrow) ? topicNarrow(narrow[0].operand, lastTopic) : narrow),
  );
