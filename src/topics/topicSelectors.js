/* @flow */
import { createSelector } from 'reselect';

import { getStreams, getTopics } from '../directSelectors';
import { getActiveNarrow, getCurrentRouteParams } from '../baseSelectors';
import { getShownMessagesInActiveNarrow } from '../chat/chatSelectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow, topicNarrow } from '../utils/narrow';

export const getTopicsInActiveNarrow = createSelector(
  getActiveNarrow,
  getTopics,
  getStreams,
  (narrow, topics, streams) => {
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

export const getLastMessageTopic = createSelector(
  getShownMessagesInActiveNarrow,
  messages => (messages.length === 0 ? '' : messages[messages.length - 1].subject),
);

export const getNarrowToSendTo = createSelector(
  getActiveNarrow,
  getLastMessageTopic,
  (narrow, lastTopic) =>
    isStreamNarrow(narrow) ? topicNarrow(narrow[0].operand, lastTopic) : narrow,
);
