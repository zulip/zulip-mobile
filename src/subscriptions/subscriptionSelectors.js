/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Narrow, Selector, Stream, Subscription } from '../types';
import { NULL_SUBSCRIPTION } from '../nullObjects';
import { isStreamOrTopicNarrow } from '../utils/narrow';
import { getSubscriptions, getStreams } from '../directSelectors';

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

export const getStreamFromId = (streamId: string): Selector<Stream> =>
  createSelector([getStreams], (streams, params) => {
    const stream = streams.find(x => x.stream_id === streamId);
    if (!stream) {
      throw new Error(`getStreamFromId: missing stream: id ${streamId}`);
    }
    return stream;
  });

export const getSubscriptionFromId = (streamId: string): Selector<Subscription> =>
  createSelector(
    [getSubscriptions],
    subscriptions => subscriptions.find(x => x.stream_id === streamId) || NULL_SUBSCRIPTION,
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
