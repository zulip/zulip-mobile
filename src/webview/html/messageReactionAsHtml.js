/* @flow */
import escape from 'lodash.escape';
import type { ReactionType } from '../../types';
import emojiMap from '../../emoji/emojiMap';

const getRealmEmojiHtml = (realmEmoji: ReactionType): string =>
  `<img class="realm-reaction" src="${escape(realmEmoji.source_url)}"/>
  `;

export default (messageId: number, reaction: ReactionType, realmEmoji: Object): string =>
  `<span onClick="" class="reaction${escape(reaction.selfReacted ? ' self-voted' : '')}"
         data-name="${escape(reaction.name)}"
         data-code="${escape(reaction.code)}"
         data-type="${escape(reaction.type)}">${
    realmEmoji[reaction.name]
      ? getRealmEmojiHtml(realmEmoji[reaction.name])
      : emojiMap[reaction.name]
  } ${escape(reaction.count)}
  </span>`;
