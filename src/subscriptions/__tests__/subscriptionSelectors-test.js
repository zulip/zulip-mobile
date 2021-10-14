// @flow strict-local

import {
  getStreamsById,
  getSubscriptionsById,
  getIsActiveStreamSubscribed,
  getStreamColorForNarrow,
} from '../subscriptionSelectors';
import {
  HOME_NARROW,
  streamNarrow,
  topicNarrow,
  pmNarrowFromUsersUnsafe,
  pm1to1NarrowFromUser,
} from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getStreamsById', () => {
  test('returns empty map for an empty input', () => {
    const state = eg.reduxState({ streams: [] });
    expect(getStreamsById(state)).toEqual(new Map());
  });

  test('returns a map with stream id as keys', () => {
    const state = eg.reduxState({ streams: [eg.stream, eg.otherStream] });
    expect(getStreamsById(state)).toEqual(
      new Map([
        [eg.stream.stream_id, eg.stream],
        [eg.otherStream.stream_id, eg.otherStream],
      ]),
    );
  });
});

describe('getSubscriptionsById', () => {
  test('returns empty map for an empty input', () => {
    const state = eg.reduxState({ subscriptions: [] });
    expect(getSubscriptionsById(state)).toEqual(new Map());
  });

  test('returns a map with stream id as keys', () => {
    const state = eg.reduxState({ subscriptions: [eg.subscription, eg.otherSubscription] });
    expect(getSubscriptionsById(state)).toEqual(
      new Map([
        [eg.subscription.stream_id, eg.subscription],
        [eg.otherSubscription.stream_id, eg.otherSubscription],
      ]),
    );
  });
});

describe('getIsActiveStreamSubscribed', () => {
  const state = eg.reduxStatePlus({ subscriptions: [eg.subscription] });

  test('return true for narrows other than stream and topic', () => {
    expect(getIsActiveStreamSubscribed(state, HOME_NARROW)).toBe(true);
  });

  test('return true if current narrowed stream is subscribed', () => {
    const narrow = streamNarrow(eg.stream.name, eg.stream.stream_id);
    expect(getIsActiveStreamSubscribed(state, narrow)).toBe(true);
  });

  test('return false if current narrowed stream is not subscribed', () => {
    const narrow = streamNarrow(eg.otherStream.name, eg.otherStream.stream_id);
    expect(getIsActiveStreamSubscribed(state, narrow)).toBe(false);
  });

  test('return true if stream of current narrowed topic is subscribed', () => {
    const narrow = topicNarrow(eg.stream.name, eg.stream.stream_id, 'news');
    expect(getIsActiveStreamSubscribed(state, narrow)).toBe(true);
  });

  test('return false if stream of current narrowed topic is not subscribed', () => {
    const narrow = topicNarrow(eg.otherStream.name, eg.otherStream.stream_id, 'news');
    expect(getIsActiveStreamSubscribed(state, narrow)).toBe(false);
  });
});

describe('getStreamColorForNarrow', () => {
  const exampleColor = '#fff';
  const state = eg.reduxState({
    subscriptions: [{ ...eg.makeSubscription({ stream: eg.stream }), color: exampleColor }],
  });

  test('return stream color for stream and topic narrow', () => {
    const narrow = streamNarrow(eg.stream.name, eg.stream.stream_id);
    expect(getStreamColorForNarrow(state, narrow)).toEqual(exampleColor);
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const unknownStream = eg.makeStream();
    const narrow = streamNarrow(unknownStream.name, unknownStream.stream_id);
    expect(getStreamColorForNarrow(state, narrow)).toEqual('gray');
  });

  test('return undefined for non topic/stream narrow', () => {
    expect(getStreamColorForNarrow(state, pm1to1NarrowFromUser(eg.otherUser))).toEqual(undefined);
    const narrow = pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser]);
    expect(getStreamColorForNarrow(state, narrow)).toEqual(undefined);
  });
});
