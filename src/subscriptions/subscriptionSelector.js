/* flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { isStreamOrTopicNarrow } from '../utils/narrow';
import { getActiveNarrow } from '../chat/chatSelectors';

export const getSubscriptions = (state: GlobalState): Stream[] => state.subscriptions;

export const getIsActiveStreamSubscribed: boolean = createSelector(
  getActiveNarrow,
  getSubscriptions,
  (activeNarrow, subscriptions) => {
    if (!isStreamOrTopicNarrow(activeNarrow)) {
      return true;
    }

    return subscriptions.find(sub => activeNarrow[0].operand === sub.name) !== undefined;
  },
);
