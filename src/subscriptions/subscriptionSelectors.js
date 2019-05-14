/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, Stream, Subscription } from '../types';
import { NULL_SUBSCRIPTION } from '../nullObjects';
import { isStreamOrTopicNarrow } from '../utils/narrow';
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
export const getStreamsById: Selector<{ [number]: Stream }> = createSelector(getStreams, streams =>
  streams.reduce((streamsById, stream) => {
    streamsById[stream.stream_id] = stream;
    return streamsById;
  }, ({}: { [number]: Stream })),
);

export const getSubscriptionsById: Selector<{ [number]: Subscription }> = createSelector(
  getSubscriptions,
  subscriptions =>
    subscriptions.reduce((subsById, subscription) => {
      subsById[subscription.stream_id] = subscription;
      return subsById;
    }, ({}: { [number]: Subscription })),
);

export const getIsActiveStreamSubscribed: Selector<boolean, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getSubscriptions(state),
  (narrow, subscriptions) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return true;
    }

    return subscriptions.find(sub => narrow[0].operand === sub.name) !== undefined;
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
export const getStreamForId: Selector<Stream, number> = createSelector(
  (state, streamId) => streamId,
  state => getStreams(state),
  (streamId, streams, params) => {
    const stream = streams.find(x => x.stream_id === streamId);
    if (!stream) {
      throw new Error(`getStreamForId: missing stream: id ${streamId}`);
    }
    return stream;
  },
);

export const getSubscriptionForId: Selector<Subscription, number> = createSelector(
  (state, streamId) => streamId,
  state => getSubscriptions(state),
  (streamId, subscriptions) =>
    subscriptions.find(x => x.stream_id === streamId) || NULL_SUBSCRIPTION,
);

export const getIsActiveStreamAnnouncementOnly: Selector<boolean, Narrow> = createSelector(
  (state, narrow) => narrow,
  state => getStreams(state),
  (narrow, streams) => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return false;
    }
    const stream = streams.find(stream_ => narrow[0].operand === stream_.name);
    return stream ? stream.is_announcement_only : false;
  },
);
