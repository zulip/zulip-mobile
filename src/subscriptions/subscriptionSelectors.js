/* flow */
import { createSelector } from 'reselect';

import { isStreamOrTopicNarrow } from '../utils/narrow';
import { getActiveNarrow, getSubscriptions, getStreams } from '../baseSelectors';

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
