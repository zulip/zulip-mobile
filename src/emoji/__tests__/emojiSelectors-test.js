/* @flow */
import { getActiveRealmEmoji } from '../emojiSelectors';

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

    expect(getActiveRealmEmoji(state)).toEqual(expectedResult);
  });
});
