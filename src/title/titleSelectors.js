/* @flow strict-local */
import type { Narrow, GlobalState } from '../types';
import { isStreamOrTopicNarrow, streamNameOfNarrow } from '../utils/narrow';
import { getSubscriptionsByName } from '../subscriptions/subscriptionSelectors';

export const DEFAULT_TITLE_BACKGROUND_COLOR = 'transparent';

/**
 * Background color to use for the app bar in narrow `narrow`.
 *
 * If `narrow` is a stream or topic narrow, this is based on the stream color.
 * Otherwise, it takes a default value.
 */
export const getTitleBackgroundColor = (state: GlobalState, narrow?: Narrow) => {
  const subscriptionsByName = getSubscriptionsByName(state);
  if (!narrow || !isStreamOrTopicNarrow(narrow)) {
    return DEFAULT_TITLE_BACKGROUND_COLOR;
  }
  const streamName = streamNameOfNarrow(narrow);
  return subscriptionsByName.get(streamName)?.color ?? 'gray';
};
