/* @flow */
import type { ReactionType, ZulipExtraEmojiType } from '../types';
import emojiMap from '../emoji/emojiMap';

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
): string =>
  `<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}" data-name="${
    reaction.name
  }" data-code="${reaction.code}" data-type="${reaction.type}">${
    realmEmoji[reaction.name]
      ? getRealmEmojiHtml(realmEmoji[reaction.name])
      : zulipExtraEmojis[reaction.name]
        ? getZulipExtraEmojiHtml(zulipExtraEmojis[reaction.name])
        : emojiMap[reaction.name]
  } ${reaction.count}
  </span>`;
