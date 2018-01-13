/* @flow */
import type { AggregateReaction, RealmEmojiType } from '../types';
import { getFullUrl } from '../utils/url';
import emojiMap from '../emoji/emojiMap';

const getRealmEmojiHtml = (
  reaction: AggregateReaction,
  realmEmoji: RealmEmojiType,
  realm: string,
) =>
  `<img class="realm-reaction" src="${getFullUrl(
    realmEmoji.source_url,
    realm,
  )}" height="16" width="16"/>
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
