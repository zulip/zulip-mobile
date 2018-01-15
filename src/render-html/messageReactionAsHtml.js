/* @flow */
import type { AggregateReaction, RealmEmojiType } from '../types';
import emojiMap from '../emoji/emojiMap';

const getRealmEmojiHtml = (
  reaction: AggregateReaction,
  realmEmoji: RealmEmojiType,
  realm: string,
) =>
  `<img class="realm-reaction" src="${realmEmoji.source_url}" height="auto" width="16"/>
  `;

export default (
  messageId: number,
  reaction: AggregateReaction,
  realmEmoji: RealmEmojiType[],
  realm: string,
) =>
  `<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}" data-name="${
    reaction.name
  }">${
    realmEmoji[reaction.name]
      ? getRealmEmojiHtml(reaction, realmEmoji[reaction.name], realm)
      : emojiMap[reaction.name]
  } ${reaction.count}
  </span>`;
