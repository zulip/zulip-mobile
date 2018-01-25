/* @flow */
import type { ReactionType } from '../types';
import emojiMap from '../emoji/emojiMap';

const getRealmEmojiHtml = (realmEmoji: ReactionType) =>
  `<img class="realm-reaction" src="${realmEmoji.source_url}"/>
  `;

export default (messageId: number, reaction: ReactionType, realmEmoji: Object) =>
  `<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}" data-name="${
    reaction.name
  }">${
    realmEmoji[reaction.name]
      ? getRealmEmojiHtml(realmEmoji[reaction.name])
      : emojiMap[reaction.name]
  } ${reaction.count}
  </span>`;
