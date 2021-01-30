/* @flow strict-local */
import type { Narrow, GlobalState } from '../types';
import { isStreamOrTopicNarrow, streamNameOfNarrow } from '../utils/narrow';
import { getSubscriptionsByName } from '../subscriptions/subscriptionSelectors';

/**
 * The stream's color for the given stream or topic narrow.
 *
 * Gives undefined for narrows that are not stream or topic narrows.
 */
export const getStreamColorForNarrow = (state: GlobalState, narrow: Narrow) => {
  const subscriptionsByName = getSubscriptionsByName(state);
  if (!isStreamOrTopicNarrow(narrow)) {
    return undefined;
  }
  const streamName = streamNameOfNarrow(narrow);
  return subscriptionsByName.get(streamName)?.color ?? 'gray';
};
