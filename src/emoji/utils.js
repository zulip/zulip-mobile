/* @flow */
import type { RealmEmojiType, ZulipExtraEmojiType } from '../types';
import { codePointMap } from './emojiMap';

export const getRealmEmojiWithName = (realmEmoji: Object, emojiName: string): RealmEmojiType =>
  realmEmoji[Object.keys(realmEmoji).find(key => realmEmoji[key].name === emojiName)];

export const getZulipExtraEmojiWithName = (
  zulipExtraEmojis: Object,
  emojiName: string,
): ZulipExtraEmojiType => zulipExtraEmojis[emojiName];

export const getEmojiTypeFromName = (
  realmEmoji: Object,
  zulipExtraEmojis: Object,
  emojiName: string,
): string | null => {
  if (getZulipExtraEmojiWithName(zulipExtraEmojis, emojiName)) {
    return 'zulip_extra_emoji';
  } else if (getRealmEmojiWithName(realmEmoji, emojiName)) {
    return 'realm_emoji';
  } else if (codePointMap[emojiName]) {
    return 'unicode_emoji';
  }
  return null;
};

export const getEmojiCodeFromName = (
  realmEmoji: Object,
  zulipExtraEmojis: Object,
  emojiName: string,
): string | null => {
  if (getZulipExtraEmojiWithName(zulipExtraEmojis, emojiName)) {
    return emojiName;
  }
  const emoji = getRealmEmojiWithName(realmEmoji, emojiName);
  if (emoji) {
    return emoji.id.toString();
  } else if (codePointMap[emojiName]) {
    return codePointMap[emojiName];
  }

  return null;
};
