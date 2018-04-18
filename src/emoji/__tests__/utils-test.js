/* @flow */
import {
  getEmojiTypeFromName,
  getEmojiCodeFromName,
  getRealmEmojiWithName,
  getZulipExtraEmojiWithName,
} from '../utils';

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

describe('getEmojiTypeFromName', () => {
  const realmEmoji = { 0: { name: 'done' }, 1: { name: 'twitter' } };
  const zulipExtraEmojis = { zulip: { emoji_url: 'https://example.com/emoji/zulip.png' } };

  test('return null if emoji is not neither of realm, zulip extra nor unicode', () => {
    expect(getEmojiTypeFromName(realmEmoji, zulipExtraEmojis, 'matter')).toBe(null);
  });

  test('if emoji is realmEmoji then return "realm_emoji"', () => {
    expect(getEmojiTypeFromName(realmEmoji, zulipExtraEmojis, 'done')).toBe('realm_emoji');
  });

  test('if emoji is zulip extra emoji then return "zulip_extra_emoji"', () => {
    expect(getEmojiTypeFromName(realmEmoji, zulipExtraEmojis, 'zulip')).toBe('zulip_extra_emoji');
  });

  test('if emoji is unicode then return "unicode_emoji"', () => {
    expect(getEmojiTypeFromName(realmEmoji, zulipExtraEmojis, 'smile')).toBe('unicode_emoji');
  });
});

describe('getEmojiCodeFromName', () => {
  const realmEmoji = { 0: { name: 'done', id: 0 }, 1: { name: 'twitter', id: 1 } };
  const zulipExtraEmojis = { zulip: { emoji_url: 'https://example.com/emoji/zulip.png' } };

  test('return null if emoji is neither of realm, zulip extra nor unicode emoji', () => {
    expect(getEmojiCodeFromName(realmEmoji, zulipExtraEmojis, 'matter')).toBe(null);
  });

  test('return emojiName as code if it is zulip extra emoji', () => {
    expect(getEmojiCodeFromName(realmEmoji, zulipExtraEmojis, 'zulip')).toBe('zulip');
  });

  test('return id from realm emoji object if it is realm emoji', () => {
    expect(getEmojiCodeFromName(realmEmoji, zulipExtraEmojis, 'done')).toBe('0');
  });

  test('return code point as code for unicode emoji', () => {
    expect(getEmojiCodeFromName(realmEmoji, zulipExtraEmojis, 'thumbs_up')).toBe('1f44d');
  });
});
