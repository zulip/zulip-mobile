/* @flow strict-local */
import type { AggregatedReaction, RealmEmojiState, RealmEmojiType } from '../../types';
import { nameToEmojiMap } from '../../emoji/data';
import template from './template';

const getRealmEmojiHtml = (realmEmoji: RealmEmojiType): string =>
  template`<img class="realm-reaction" src="${realmEmoji.source_url}"/>
  `;

export default (
  messageId: number,
  reaction: AggregatedReaction,
  realmEmoji: RealmEmojiState,
): string =>
  template`<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}"
        data-name="${reaction.name}"
        data-code="${reaction.code}"
        data-type="${reaction.type}">$!${
    realmEmoji[reaction.name]
      ? getRealmEmojiHtml(realmEmoji[reaction.name])
      : nameToEmojiMap[reaction.name]
  }&nbsp;${reaction.count}
</span>`;
