/* @flow */
import type { ReactionType } from '../../types';
import emojiMap from '../../emoji/emojiMap';
import template from './template';

const getRealmEmojiHtml = (realmEmoji: ReactionType): string =>
  template`<img class="realm-reaction" src="${realmEmoji.source_url}"/>
  `;

export default (messageId: number, reaction: ReactionType, realmEmoji: Object): string =>
  template`<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}"
         data-name="${reaction.name}"
         data-code="${reaction.code}"
         data-type="${reaction.type}">$!${
    realmEmoji[reaction.name]
      ? getRealmEmojiHtml(realmEmoji[reaction.name])
      : emojiMap[reaction.name]
  } ${reaction.count}
  </span>`;
