/* flow */
import { createSelector } from 'reselect';

import { isStreamOrTopicNarrow } from '../utils/narrow';
import { getActiveNarrow, getSubscriptions } from '../baseSelectors';

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
