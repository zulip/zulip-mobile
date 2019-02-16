/* @flow strict-local */
import { createSelector } from 'reselect';

import type {
  MuteState,
  Narrow,
  GlobalState,
  Selector,
  Stream,
  StreamsState,
  StreamUnreadItem,
  Topic,
  TopicExtended,
  TopicsState,
} from '../types';
import { getMute, getStreams, getTopics, getUnreadStreams } from '../directSelectors';
import { getShownMessagesForNarrow } from '../chat/narrowsSelectors';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow } from '../utils/narrow';

export const getTopicsForNarrow: Selector<string[], Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getTopics(state),
  state => getStreams(state),
  (narrow: Narrow, topics: TopicsState, streams: StreamsState) => {
    if (!isStreamNarrow(narrow)) {
      return NULL_ARRAY;
    }
    const stream = streams.find(x => x.name === narrow[0].operand);

    if (!stream || !topics[stream.stream_id]) {
      return NULL_ARRAY;
    }

    return topics[stream.stream_id].map(x => x.name);
  },
);

export const getTopicsForStream: Selector<?(TopicExtended[]), number> = createSelector(
  (state, streamId) => getTopics(state)[streamId],
  state => getMute(state),
  (state, streamId) => getStreamsById(state).get(streamId),
  state => getUnreadStreams(state),
  (
    topicList: Topic[],
    mute: MuteState,
    stream: Stream | void,
    unreadStreams: StreamUnreadItem[],
  ) => {
    if (!topicList || !stream) {
      return undefined;
    }

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

export const getLastMessageTopic = (state: GlobalState, narrow: Narrow): string => {
  const messages = getShownMessagesForNarrow(state, narrow);
  return messages.length === 0 ? '' : messages[messages.length - 1].subject;
};
