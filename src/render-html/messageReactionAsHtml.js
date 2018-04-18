/* @flow */
import type { ReactionType } from '../types';
import emojiMap from '../emoji/emojiMap';
import { getRealmEmojiWithName, getZulipExtraEmojiWithName } from '../emoji/utils';

const getEmojiImgHtml = (url: string): string =>
  `<img class="realm-reaction" src="${url}"/>
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
  const url =
    (isRealmEmoji && isRealmEmoji.source_url) || (isZulipExtraEmoji && isZulipExtraEmoji.emoji_url);
  return `<span onClick="" class="reaction${
    reaction.selfReacted ? ' self-voted' : ''
  }" data-name="${reaction.name}" data-code="${reaction.code}" data-type="${reaction.type}">${
    url ? getEmojiImgHtml(url) : emojiMap[reaction.name]
  } ${reaction.count}
  </span>`;
};
