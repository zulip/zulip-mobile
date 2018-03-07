import deepFreeze from 'deep-freeze';

import {
  getStreamsById,
  getSubscriptionsById,
  getIsActiveStreamSubscribed,
  getSubscribedStreams,
} from '../subscriptionSelectors';
import { homeNarrow, streamNarrow, topicNarrow } from '../../utils/narrow';

describe('getStreamsById', () => {
  test('returns empty object for an empty input', () => {
    const state = deepFreeze({
      streams: [],
    });
    expect(getStreamsById(state)).toEqual({});
  });

  test('returns an object with stream id as keys', () => {
    const state = deepFreeze({
      streams: [{ stream_id: 1 }, { stream_id: 2 }],
    });

    const expectedState = {
      '1': { stream_id: 1 },
      '2': { stream_id: 2 },
    };

    const streamsById = getStreamsById(state);

    expect(streamsById).toEqual(expectedState);
  });
});

describe('getSubscriptionsById', () => {
  test('returns empty object for an empty input', () => {
    const state = deepFreeze({
      subscriptions: [],
    });
    expect(getSubscriptionsById(state)).toEqual({});
  });

  test('returns an object with stream id as keys', () => {
    const state = deepFreeze({
      subscriptions: [{ stream_id: 1 }, { stream_id: 2 }],
    });

    const expectedState = {
      '1': { stream_id: 1 },
      '2': { stream_id: 2 },
    };

    const subscriptionsById = getSubscriptionsById(state);

    expect(subscriptionsById).toEqual(expectedState);
  });
});

describe('getIsActiveStreamSubscribed', () => {
  test('return true for narrows other than stream and topic', () => {
    const state = deepFreeze({});

    expect(getIsActiveStreamSubscribed(homeNarrow)(state)).toBe(true);
  });

  test('return true if current narrowed stream is subscribed', () => {
    const state = deepFreeze({
      subscriptions: [{ name: 'announce' }],
    });

    expect(getIsActiveStreamSubscribed(streamNarrow('announce'))(state)).toBe(true);
  });

  test('return false if current narrowed stream is not subscribed', () => {
    const state = deepFreeze({
      subscriptions: [{ name: 'announce' }],
    });

    expect(getIsActiveStreamSubscribed(streamNarrow('all'))(state)).toBe(false);
  });

  test('return true if stream of current narrowed topic is subscribed', () => {
    const state = deepFreeze({
      subscriptions: [{ name: 'announce' }],
    });

    expect(getIsActiveStreamSubscribed(topicNarrow('announce', 'news'))(state)).toBe(true);
  });

  test('return false if stream of current narrowed topic is not subscribed', () => {
    const state = deepFreeze({
      subscriptions: [{ name: 'announce' }],
    });

    expect(getIsActiveStreamSubscribed(topicNarrow('all', 'news'))(state)).toBe(false);
  });
});

describe('getSubscribedStreams', () => {
  test('get all subscribed streams', () => {
    const state = deepFreeze({
      streams: [
        { stream_id: 1, name: 'all', description: 'stream for all' },
        { stream_id: 2, name: 'new announce', description: 'stream for announce' },
        { stream_id: 3, name: 'Denmark', description: 'Denmark is awesome' },
        { stream_id: 4, name: 'general', description: 'stream for general' },
      ],
      subscriptions: [
        { stream_id: 1, name: 'all', color: '#001' },
        { stream_id: 2, name: 'announce', color: '#002' },
        { stream_id: 4, name: 'general', color: '#003' },
      ],
    });

    const expectedResult = [
      { stream_id: 1, name: 'all', color: '#001', description: 'stream for all' },
      { stream_id: 2, name: 'new announce', color: '#002', description: 'stream for announce' },
      { stream_id: 4, name: 'general', color: '#003', description: 'stream for general' },
    ];

    const actualResult = getSubscribedStreams(state);
    expect(actualResult).toEqual(expectedResult);
  });
});
