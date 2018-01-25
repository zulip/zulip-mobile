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
          smile: {
            deactivated: false,
            source_url: '/static/user_upload/smile.png',
          },
          laugh: {
            deactivated: false,
            source_url: '/static/user_upload/laugh.png',
          },
          sad: {
            deactivated: true,
            source_url: '/static/user_upload/sad.png',
          },
        },
      },
    };

    const expectedResult = {
      smile: {
        deactivated: false,
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      laugh: {
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
          smile: {
            source_url: '/static/user_upload/smile.png',
          },
          laugh: {
            source_url: 'https://example.com/static/user_upload/laugh.png',
          },
        },
      },
    };

    const expectedResult = {
      smile: {
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      laugh: {
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
    };

    expect(getAllRealmEmoji(deepFreeze(state))).toEqual(expectedResult);
  });
});
