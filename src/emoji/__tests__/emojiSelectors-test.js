/* @flow strict-local */
import deepFreeze from 'deep-freeze';
import {
  getActiveRealmEmojiById,
  getAllRealmEmojiById,
  getActiveRealmEmojiByName,
  getAllRealmEmojiByName,
} from '../emojiSelectors';

describe('getActiveRealmEmojiById', () => {
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

    expect(getActiveRealmEmojiById(deepFreeze(state))).toEqual(expectedResult);
  });
});

describe('getAllRealmEmojiById', () => {
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

    expect(getAllRealmEmojiById(deepFreeze(state))).toEqual(expectedResult);
  });
});

describe('getAllRealmEmojiByName', () => {
  test('get realm emoji object with emoji names as the keys', () => {
    const state = {
      accounts: [{ realm: 'https://example.com' }],
      realm: {
        emoji: {
          1: {
            name: 'smile',
            source_url: 'https://example.com/static/user_upload/smile.png',
          },
          2: {
            name: 'laugh',
            source_url: 'https://example.com/static/user_upload/laugh.png',
          },
        },
      },
    };

    const expectedResult = {
      smile: {
        name: 'smile',
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      laugh: {
        name: 'laugh',
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
    };
    expect(getAllRealmEmojiByName(deepFreeze(state))).toEqual(expectedResult);
  });
});

describe('getActiveRealmEmojiByName', () => {
  test('get realm emoji object with emoji names as the keys', () => {
    const state = {
      accounts: [{ realm: 'https://example.com' }],
      realm: {
        emoji: {
          1: {
            name: 'smile',
            source_url: 'https://example.com/static/user_upload/smile.png',
          },
          2: {
            name: 'laugh',
            source_url: 'https://example.com/static/user_upload/laugh.png',
          },
        },
      },
    };

    const expectedResult = {
      smile: {
        name: 'smile',
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      laugh: {
        name: 'laugh',
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
    };
    expect(getActiveRealmEmojiByName(deepFreeze(state))).toEqual(expectedResult);
  });
});
