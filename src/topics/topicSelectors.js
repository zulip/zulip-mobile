/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getStreams, getTopics } from '../directSelectors';
import { getTopicListScreenParams } from '../baseSelectors';
import { getShownMessagesForNarrow } from '../chat/chatSelectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow, topicNarrow } from '../utils/narrow';

export const getTopicsForNarrow = (narrow: Narrow) =>
  createSelector(getTopics, getStreams, (topics, streams) => {
    if (!isStreamNarrow(narrow)) {
      return NULL_ARRAY;
    }
    const stream = streams.find(x => x.name === narrow[0].operand);

    if (!stream || !topics[stream.stream_id]) {
      return NULL_ARRAY;
    }

    return topics[stream.stream_id].map(x => x.name);
  });

export const getTopicsInScreen = createSelector(
  getTopicListScreenParams,
  getTopics,
  (params, topics) => topics[params.streamId],
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
