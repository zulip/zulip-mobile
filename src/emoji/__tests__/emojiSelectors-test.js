/* @flow */
import { getActiveRealmEmoji } from '../emojiSelectors';

describe('getActiveRealmEmoji', () => {
  test('filter out all deactivated emojis', () => {
    const state = {
      realm: {
        emoji: {
          smile: {
            deactivated: false,
          },
          laugh: {
            deactivated: false,
          },
          sad: {
            deactivated: true,
          },
        },
      },
    };

    const expectedResult = {
      smile: {
        deactivated: false,
      },
      laugh: {
        deactivated: false,
      },
    };

    expect(getActiveRealmEmoji(state)).toEqual(expectedResult);
  });
});
