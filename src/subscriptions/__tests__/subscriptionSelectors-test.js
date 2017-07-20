import deepFreeze from 'deep-freeze';

import { getIsActiveStreamSubscribed, getSubscribedStreams } from '../subscriptionSelectors';
import { homeNarrow, streamNarrow, topicNarrow } from '../../utils/narrow';

describe('getIsActiveStreamSubscribed', () => {
  test('return true for narrows other than stream and topic', () => {
    const state = {
      chat: {
        narrow: homeNarrow(),
      },
    };
    deepFreeze(state);
    expect(getIsActiveStreamSubscribed(state)).toBe(true);
  });

  test('return true if current narrowed stream is subscribed', () => {
    const state = {
      chat: {
        narrow: streamNarrow('announce'),
      },
      subscriptions: [{ name: 'announce' }],
    };
    deepFreeze(state);
    expect(getIsActiveStreamSubscribed(state)).toBe(true);
  });

  test('return false if current narrowed stream is not subscribed', () => {
    const state = {
      chat: {
        narrow: streamNarrow('all'),
      },
      subscriptions: [{ name: 'announce' }],
    };
    deepFreeze(state);
    expect(getIsActiveStreamSubscribed(state)).toBe(false);
  });

  test('return true if stream of current narrowed topic is subscribed', () => {
    const state = {
      chat: {
        narrow: topicNarrow('announce', 'news'),
      },
      subscriptions: [{ name: 'announce' }],
    };
    deepFreeze(state);
    expect(getIsActiveStreamSubscribed(state)).toBe(true);
  });

  test('return false if stream of current narrowed topic is not subscribed', () => {
    const state = {
      chat: {
        narrow: streamNarrow('all', 'news'),
      },
      subscriptions: [{ name: 'announce' }],
    };
    deepFreeze(state);
    expect(getIsActiveStreamSubscribed(state)).toBe(false);
  });
});

describe('getSubscribedStreams', () => {
  test('get all subscribed streams', () => {
    const state = {
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
    };
    deepFreeze(state);
    const expectedResult = [
      { stream_id: 1, name: 'all', color: '#001', description: 'stream for all' },
      { stream_id: 2, name: 'new announce', color: '#002', description: 'stream for announce' },
      { stream_id: 4, name: 'general', color: '#003', description: 'stream for general' },
    ];

    const actualResult = getSubscribedStreams(state);
    expect(actualResult).toEqual(expectedResult);
  });
});
