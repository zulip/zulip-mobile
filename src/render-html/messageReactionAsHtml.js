/* @flow */
import type { ReactionType } from '../types';
import emojiMap from '../emoji/emojiMap';

const getRealmEmojiHtml = (reaction: ReactionType, realmEmoji: Object) =>
  `<img class="realm-reaction" src="${realmEmoji.source_url}" />
  `;

export default (messageId: number, reaction: ReactionType, realmEmoji: Object) =>
  `<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}" data-name="${
    reaction.name
  }">${
    realmEmoji[reaction.name]
      ? getRealmEmojiHtml(reaction, realmEmoji[reaction.name])
      : emojiMap[reaction.name]
  } ${reaction.count}
  </span>`;
