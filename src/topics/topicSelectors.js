/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, TopicExtended, TopicsState } from '../types';
import { getTopics } from '../directSelectors';
import { getUnread, getUnreadCountForTopic } from '../unread/unreadModel';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow, streamIdOfNarrow } from '../utils/narrow';
import { getMute, isTopicMuted } from '../mute/muteModel';

export const getTopicsForNarrow: Selector<$ReadOnlyArray<string>, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getTopics(state),
  (narrow: Narrow, topics: TopicsState) => {
    if (!isStreamNarrow(narrow)) {
      return NULL_ARRAY;
    }
    const streamId = streamIdOfNarrow(narrow);

    if (!topics[streamId]) {
      return NULL_ARRAY;
    }
    return topics[streamId].map(x => x.name);
  },
);

export const getTopicsForStream: Selector<?$ReadOnlyArray<TopicExtended>, number> = createSelector(
  (state, streamId) => getTopics(state)[streamId],
  state => getMute(state),
  (state, streamId) => getStreamsById(state).get(streamId),
  state => getUnread(state),
  (topicList, mute, stream, unread) => {
    if (!topicList || !stream) {
      return undefined;
    }

    return topicList.map(({ name, max_id }) => {
      const isMuted = isTopicMuted(stream.stream_id, stream.name, name, mute);
      const unreadCount = getUnreadCountForTopic(unread, stream.stream_id, name);
      return { name, max_id, isMuted, unreadCount };
    });
  },
);
