/* @flow */
import type { RealmEmojiType, ZulipExtraEmojiType } from '../types';

export const getRealmEmojiWithName = (realmEmoji: Object, emojiName: string): RealmEmojiType =>
  realmEmoji[Object.keys(realmEmoji).find(key => realmEmoji[key].name === emojiName)];

export const getZulipExtraEmojiWithName = (
  zulipExtraEmojis: Object,
  emojiName: string,
): ZulipExtraEmojiType => zulipExtraEmojis[emojiName];
