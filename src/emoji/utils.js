/* @flow */

export const getRealmEmojiWithName = (realmEmoji: Object, emojiName: string) =>
  realmEmoji[Object.keys(realmEmoji).find(key => realmEmoji[key].name === emojiName)];

export const getZulipExtraEmojiWithName = (zulipExtraEmojis: Object, emojiName: string) =>
  zulipExtraEmojis[emojiName];
