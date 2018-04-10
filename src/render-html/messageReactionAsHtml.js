/* @flow */
import type { ReactionType, ZulipExtraEmojiType } from '../types';
import emojiMap from '../emoji/emojiMap';
import { getRealmEmojiWithName, getZulipExtraEmojiWithName } from '../emoji/utils';

const getRealmEmojiHtml = (realmEmoji: ReactionType): string =>
  `<img class="realm-reaction" src="${realmEmoji.source_url}"/>
  `;

const getZulipExtraEmojiHtml = (
  zulipExtraEmoji: ZulipExtraEmojiType,
): string => `<img class="realm-reaction" src="${zulipExtraEmoji.emoji_url}"/>
  `;

export default (
  messageId: number,
  reaction: ReactionType,
  realmEmoji: Object,
  zulipExtraEmojis: Object,
): string => {
  const isRealmEmoji = getRealmEmojiWithName(realmEmoji, reaction.name);
  const isZulipExtraEmoji =
    !isRealmEmoji && getZulipExtraEmojiWithName(zulipExtraEmojis, reaction.name);
  // do not call if we already got emoji

  return `<span onClick="" class="reaction${
    reaction.selfReacted ? ' self-voted' : ''
  }" data-name="${reaction.name}" data-code="${reaction.code}" data-type="${reaction.type}">${
    isRealmEmoji
      ? getRealmEmojiHtml(isRealmEmoji)
      : isZulipExtraEmoji ? getZulipExtraEmojiHtml(isZulipExtraEmoji) : emojiMap[reaction.name]
  } ${reaction.count}
  </span>`;
};
