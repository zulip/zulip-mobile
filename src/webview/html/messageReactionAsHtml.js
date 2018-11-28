/* @flow strict-local */
import type { AggregatedReaction, RealmEmojiType } from '../../types';
import { codeToEmojiMap } from '../../emoji/data';
import template from './template';

export default (
  messageId: number,
  reaction: AggregatedReaction,
  allRealmEmojiById: { [id: string]: RealmEmojiType },
): string =>
  template`<span onClick="" class="reaction${reaction.selfReacted ? ' self-voted' : ''}"
        data-name="${reaction.name}"
        data-code="${reaction.code}"
        data-type="${reaction.type}">$!${
    allRealmEmojiById[reaction.code]
      ? template`<img src="${allRealmEmojiById[reaction.code].source_url}"/>`
      : codeToEmojiMap[reaction.code]
  }&nbsp;${reaction.count}
</span>`;
