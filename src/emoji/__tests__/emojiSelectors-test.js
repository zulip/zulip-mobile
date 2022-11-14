import deepFreeze from 'deep-freeze';
import {
  getActiveImageEmojiById,
  getAllImageEmojiById,
  getAllImageEmojiByCode,
} from '../emojiSelectors';

describe('getActiveImageEmojiById', () => {
  test('filter out all deactivated emojis', () => {
    const state = {
      accounts: [
        {
          realm: new URL('https://example.com'),
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
        reaction_type: 'realm_emoji',
        deactivated: false,
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      2: {
        reaction_type: 'realm_emoji',
        deactivated: false,
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
      zulip: {
        reaction_type: 'zulip_extra_emoji',
        deactivated: false,
        name: 'zulip',
        code: 'zulip',
        source_url: 'https://example.com/static/generated/emoji/images/emoji/unicode/zulip.png',
      },
    };

    expect(getActiveImageEmojiById(deepFreeze(state))).toEqual(expectedResult);
  });
});

describe('getAllImageEmojiById', () => {
  test('get realm emojis with absolute url', () => {
    const state = {
      accounts: [{ realm: new URL('https://example.com') }],
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
      '1': {
        reaction_type: 'realm_emoji',
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      '2': {
        reaction_type: 'realm_emoji',
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
      zulip: {
        reaction_type: 'zulip_extra_emoji',
        deactivated: false,
        name: 'zulip',
        code: 'zulip',
        source_url: 'https://example.com/static/generated/emoji/images/emoji/unicode/zulip.png',
      },
    };

    expect(getAllImageEmojiById(deepFreeze(state))).toEqual(expectedResult);
  });
});

describe('getAllImageEmojiByCode', () => {
  test('get realm emoji object with emoji names as the keys', () => {
    const state = {
      accounts: [{ realm: new URL('https://example.com') }],
      realm: {
        emoji: {
          1: {
            code: '1',
            name: 'smile',
            source_url: 'https://example.com/static/user_upload/smile.png',
          },
          2: {
            code: '2',
            name: 'laugh',
            source_url: 'https://example.com/static/user_upload/laugh.png',
          },
        },
      },
    };

    const expectedResult = {
      1: {
        reaction_type: 'realm_emoji',
        code: '1',
        name: 'smile',
        source_url: 'https://example.com/static/user_upload/smile.png',
      },
      2: {
        reaction_type: 'realm_emoji',
        code: '2',
        name: 'laugh',
        source_url: 'https://example.com/static/user_upload/laugh.png',
      },
      zulip: {
        reaction_type: 'zulip_extra_emoji',
        deactivated: false,
        name: 'zulip',
        code: 'zulip',
        source_url: 'https://example.com/static/generated/emoji/images/emoji/unicode/zulip.png',
      },
    };
    expect(getAllImageEmojiByCode(deepFreeze(state))).toEqual(expectedResult);
  });
});
