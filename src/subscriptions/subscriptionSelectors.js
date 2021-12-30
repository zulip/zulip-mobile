/* @flow strict-local */
import { createSelector } from 'reselect';

import type { PerAccountState, Narrow, Selector, Stream, Subscription } from '../types';
import { isStreamOrTopicNarrow, streamIdOfNarrow } from '../utils/narrow';
import { getSubscriptions, getStreams } from '../directSelectors';

/**
 * All streams in the current realm, by ID.
 *
 * Prefer `getStreamForId` for all normal UI specific to a stream, and other
 * codepaths which relate to a single stream and assume it exists.
 *
 * This selector is appropriate when a stream might not exist, or multiple
 * streams are relevant.
 *
 * See also `getStreams` for the stream objects as an array.
 */
export const getStreamsById: Selector<Map<number, Stream>> = createSelector(
  getStreams,
  streams => new Map(streams.map(stream => [stream.stream_id, stream])),
);

export const getStreamsByName: Selector<Map<string, Stream>> = createSelector(
  getStreams,
  streams => new Map(streams.map(stream => [stream.name, stream])),
);

export const getSubscriptionsById: Selector<Map<number, Subscription>> = createSelector(
  getSubscriptions,
  subscriptions =>
    new Map(subscriptions.map(subscription => [subscription.stream_id, subscription])),
);

export const getIsActiveStreamSubscribed: Selector<boolean, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getSubscriptionsById(state),
  (narrow, subscriptions) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return true;
    }
    return subscriptions.get(streamIdOfNarrow(narrow)) !== undefined;
  },
);

/**
 * The stream with the given ID; throws if none.
 *
 * This is for use in all the normal UI specific to a stream, including
 * stream and topic narrows and stream messages, and other codepaths which
 * assume the given stream exists.
 *
 * See `getStreamsById` for use when a stream might not exist, or when
 * multiple streams are relevant.
 */
export const getStreamForId = (state: PerAccountState, streamId: number): Stream => {
  const stream = getStreamsById(state).get(streamId);
  if (!stream) {
    throw new Error(`getStreamForId: missing stream: id ${streamId}`);
  }
  return stream;
};

export const getIsActiveStreamAnnouncementOnly: Selector<boolean, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getStreamsById(state),
  (narrow, streams) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return false;
    }
    const stream = streams.get(streamIdOfNarrow(narrow));
    return stream ? stream.is_announcement_only : false;
  },
);

/**
 * The stream's color for the given stream or topic narrow.
 *
 * Gives undefined for narrows that are not stream or topic narrows.
 */
export const getStreamColorForNarrow = (state: PerAccountState, narrow: Narrow): string | void => {
  if (!isStreamOrTopicNarrow(narrow)) {
    return undefined;
  }

  const subscriptionsById = getSubscriptionsById(state);
  const streamId = streamIdOfNarrow(narrow);
  return subscriptionsById.get(streamId)?.color ?? 'gray';
};
