import deepFreeze from 'deep-freeze';

import { getIsActiveStreamSubscribed } from '../subscriptionSelectors';
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
