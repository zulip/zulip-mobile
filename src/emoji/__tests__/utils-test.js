/* @flow */
import { getRealmEmojiWithName, getZulipExtraEmojiWithName } from '../utils';

describe('getRealmEmojiWithName', () => {
  const realmEmoji = {
    1: {
      name: 'done',
    },
    2: {
      name: 'tick',
    },
  };
  test('return undefined if it is not realm emoji', () => {
    expect(getRealmEmojiWithName(realmEmoji, 'zulip')).toBe(undefined);
  });

  test('return realm emoji object if it is realm emoji', () => {
    expect(getRealmEmojiWithName(realmEmoji, 'done')).toEqual({ name: 'done' });
  });
});

describe('getZulipExtraEmojiWithName', () => {
  const zulipExtraEmojis = {
    zulip: { emoji_url: 'https://example.com/emoji/zulip.png' },
  };

  test('return undefined if it is not zulip extra emoji', () => {
    expect(getZulipExtraEmojiWithName(zulipExtraEmojis, 'done')).toBe(undefined);
  });

  test('return extra emoji object if it is zulip extra emoji', () => {
    expect(getZulipExtraEmojiWithName(zulipExtraEmojis, 'zulip')).toEqual({
      emoji_url: 'https://example.com/emoji/zulip.png',
    });
  });
});
