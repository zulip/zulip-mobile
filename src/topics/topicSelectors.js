/* @flow */
import { createSelector } from 'reselect';

import { getActiveNarrow, getStreams, getTopics } from '../selectors';
import { NULL_ARRAY } from '../nullObjects';
import { isStreamNarrow } from '../utils/narrow';

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
