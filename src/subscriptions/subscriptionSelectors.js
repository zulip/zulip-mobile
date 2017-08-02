/* flow */
import { createSelector } from 'reselect';

import { isStreamOrTopicNarrow } from '../utils/narrow';
import { getActiveNarrow, getSubscriptions, getStreams } from '../baseSelectors';
import { NULL_STREAM } from '../nullObjects';

export const getStreamsById = createSelector(getStreams, streams =>
  streams.reduce((streamsById, stream) => {
    streamsById[stream.stream_id] = stream;
    return streamsById;
  }, {}),
);

export const getStreamByName = (streams: any[], name: string) =>
  streams.find(stream => stream.name === name) || NULL_STREAM;

export const getIsActiveStreamSubscribed = createSelector(
  getActiveNarrow,
  getSubscriptions,
  (activeNarrow, subscriptions) => {
    if (!isStreamOrTopicNarrow(activeNarrow)) {
      return true;
    }

    return subscriptions.find(sub => activeNarrow[0].operand === sub.name) !== undefined;
  },
);

export const getSubscribedStreams = createSelector(
  getStreams,
  getSubscriptions,
  (allStreams, allSubscriptions) =>
    allSubscriptions.map(subscription => ({
      ...subscription,
      ...allStreams.find(stream => stream.stream_id === subscription.stream_id),
    })),
);
