/* @flow strict-local */
import { createSelector } from 'reselect';

import type {
  Narrow,
  GlobalState,
  Selector,
  StreamsState,
  TopicExtended,
  TopicsState,
} from '../types';
import { getMute, getStreams, getTopics } from '../directSelectors';
import { getUnread, getUnreadCountForTopic } from '../unread/unreadModel';
import { getShownMessagesForNarrow } from '../chat/narrowsSelectors';
import { getStreamsById } from '../subscriptions/subscriptionSelectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow, streamNameOfNarrow } from '../utils/narrow';

export const getTopicsForNarrow: Selector<string[], Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getTopics(state),
  state => getStreams(state),
  (narrow: Narrow, topics: TopicsState, streams: StreamsState) => {
    if (!isStreamNarrow(narrow)) {
      return NULL_ARRAY;
    }
    const streamName = streamNameOfNarrow(narrow);

    // TODO (#4333): Look for the stream by its ID, not its name. One
    // expected consequence of the current code is that
    // `TopicAutocomplete` would stop showing any topics, if someone
    // changed the stream name while you were looking at
    // `TopicAutocomplete`.
    const stream = streams.find(x => x.name === streamName);
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
  state => getUnread(state),
  (topicList, mute, stream, unread) => {
    if (!topicList || !stream) {
      return undefined;
    }

    return topicList.map(({ name, max_id }) => {
      const isMuted = !!mute.find(x => x[0] === stream.name && x[1] === name);
      const unreadCount = getUnreadCountForTopic(unread, stream.stream_id, name);
      return { name, max_id, isMuted, unreadCount };
    });
  },
);

export const getLastMessageTopic = (state: GlobalState, narrow: Narrow): string => {
  const messages = getShownMessagesForNarrow(state, narrow);
  return messages.length === 0 ? '' : messages[messages.length - 1].subject;
};
