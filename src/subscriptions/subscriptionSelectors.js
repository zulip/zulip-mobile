/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, Narrow, Selector, Stream, Subscription } from '../types';
import { isStreamOrTopicNarrow, streamNameOfNarrow } from '../utils/narrow';
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

export const getSubscriptionsById: Selector<Map<number, Subscription>> = createSelector(
  getSubscriptions,
  subscriptions =>
    new Map(subscriptions.map(subscription => [subscription.stream_id, subscription])),
);

export const getSubscriptionsByName: Selector<Map<string, Subscription>> = createSelector(
  getSubscriptions,
  subscriptions => new Map(subscriptions.map(subscription => [subscription.name, subscription])),
);

export const getIsActiveStreamSubscribed: Selector<boolean, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getSubscriptions(state),
  (narrow, subscriptions) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return true;
    }
    const streamName = streamNameOfNarrow(narrow);

    return subscriptions.find(sub => streamName === sub.name) !== undefined;
  },
);

export const getSubscribedStreams: Selector<Subscription[]> = createSelector(
  getStreams,
  getSubscriptions,
  (allStreams, allSubscriptions) =>
    allSubscriptions.map(subscription => ({
      ...subscription,
      ...allStreams.find(stream => stream.stream_id === subscription.stream_id),
    })),
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
export const getStreamForId = (state: GlobalState, streamId: number): Stream => {
  const stream = getStreamsById(state).get(streamId);
  if (!stream) {
    throw new Error(`getStreamForId: missing stream: id ${streamId}`);
  }
  return stream;
};

export const getIsActiveStreamAnnouncementOnly: Selector<boolean, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getStreams(state),
  (narrow, streams) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return false;
    }
    const streamName = streamNameOfNarrow(narrow);

    const stream = streams.find(stream_ => streamName === stream_.name);
    return stream ? stream.is_announcement_only : false;
  },
);
