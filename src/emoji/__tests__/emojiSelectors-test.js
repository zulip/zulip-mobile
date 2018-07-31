/* @flow */
import deepFreeze from 'deep-freeze';
import { getActiveRealmEmoji, getAllRealmEmoji } from '../emojiSelectors';

describe('getActiveRealmEmoji', () => {
  test('filter out all deactivated emojis', () => {
    const state = {
      accounts: [
        {
          realm: 'https://example.com',
        },
      ],
      realm: {
        emoji: {
          1: {
            deactivated: false,
            source_url: '/static/user_upload/smile.png',
          },
          2: {
            deactivated: false,
            source_url: '/static/user_upload/laugh.png',
          },
          3: {
            deactivated: true,
            source_url: '/static/user_upload/sad.png',
          },
        },
      },
    };

    const expectedResult = {
      1: {
        deactivated: false,
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      2: {
        deactivated: false,
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
    };

    expect(getActiveRealmEmoji(deepFreeze(state))).toEqual(expectedResult);
  });
});

describe('getAllRealmEmoji', () => {
  test('get realm emojis with absolute url', () => {
    const state = {
      accounts: [{ realm: 'https://example.com' }],
      realm: {
        emoji: {
          1: {
            source_url: '/static/user_upload/smile.png',
          },
          2: {
            source_url: 'https://example.com/static/user_upload/laugh.png',
          },
        },
      },
    };

    const expectedResult = {
      1: {
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      2: {
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
    };

    expect(getAllRealmEmoji(deepFreeze(state))).toEqual(expectedResult);
  });
});
