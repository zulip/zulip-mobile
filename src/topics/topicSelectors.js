/* @flow */
import { createSelector } from 'reselect';

import type { Narrow } from '../types';
import { getStreams, getTopics } from '../directSelectors';
import { getCurrentRouteParams } from '../baseSelectors';
import { getShownMessagesforNarrow } from '../chat/chatSelectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow, topicNarrow } from '../utils/narrow';

export const getTopicsforNarrow = (narrow: Narrow) =>
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
  getCurrentRouteParams,
  getTopics,
  (params, topics) => {
    if (!params.streamId || !topics[params.streamId]) {
      return NULL_ARRAY;
    }

    return topics[params.streamId];
  },
);

export const getLastMessageTopic = (narrow: Narrow) =>
  createSelector(
    getShownMessagesforNarrow(narrow),
    messages => (messages.length === 0 ? '' : messages[messages.length - 1].subject),
  );

export const getNarrowToSendTo = (narrow: Narrow) =>
  createSelector(
    getLastMessageTopic(narrow),
    lastTopic => (isStreamNarrow(narrow) ? topicNarrow(narrow[0].operand, lastTopic) : narrow),
  );
