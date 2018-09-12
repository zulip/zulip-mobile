/* @flow */
import { createSelector } from 'reselect';

import type { Narrow, Stream, Subscription } from '../types';
import { NULL_STREAM, NULL_SUBSCRIPTION } from '../nullObjects';
import { isStreamOrTopicNarrow } from '../utils/narrow';
import { getSubscriptions, getStreams } from '../directSelectors';

export const getStreamsById = createSelector(getStreams, streams =>
  streams.reduce((streamsById, stream) => {
    streamsById[stream.stream_id] = stream;
    return streamsById;
  }, ({}: { [number]: Stream })),
);

export const getSubscriptionsById = createSelector(getSubscriptions, subscriptions =>
  subscriptions.reduce((subsById, subscription) => {
    subsById[subscription.stream_id] = subscription;
    return subsById;
  }, ({}: { [number]: Subscription })),
);

export const getIsActiveStreamSubscribed = (narrow: Narrow) =>
  createSelector(getSubscriptions, subscriptions => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return true;
    }

    return subscriptions.find(sub => narrow[0].operand === sub.name) !== undefined;
  });

export const getSubscribedStreams = createSelector(
  getStreams,
  getSubscriptions,
  (allStreams, allSubscriptions) =>
    allSubscriptions.map(subscription => ({
      ...subscription,
      ...allStreams.find(stream => stream.stream_id === subscription.stream_id),
    })),
);

export const getStreamFromId = (streamId: string) =>
  createSelector(
    [getStreams],
    (streams, params) => streams.find(x => x.stream_id === streamId) || NULL_STREAM,
  );

export const getSubscriptionFromId = (streamId: string) =>
  createSelector(
    [getSubscriptions],
    subscriptions => subscriptions.find(x => x.stream_id === streamId) || NULL_SUBSCRIPTION,
  );

export const getIsActiveStreamAnnouncementOnly = (narrow: Narrow) =>
  createSelector(getStreams, streams => {
    if (!isStreamOrTopicNarrow(narrow)) {
      return false;
    }
    const stream = streams.find(stream_ => narrow[0].operand === stream_.name);
    return stream ? stream.is_announcement_only : false;
  });
