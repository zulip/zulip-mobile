/* @flow strict-local */
import type { Reaction, RealmEmojiType } from '../../types';
import aggregateReactions from '../../reactions/aggregateReactions';
import template from './template';
import messageReactionAsHtml from './messageReactionAsHtml';

export default (
  reactions: Reaction[],
  messageId: number,
  ownEmail: string,
  allRealmEmojiById: { [id: string]: RealmEmojiType },
): string => {
  if (!reactions || reactions.length === 0) {
    return '';
  }

  const aggregated = aggregateReactions(reactions, ownEmail);

  return template`
    <div class="reaction-list">
      $!${aggregated.map(r => messageReactionAsHtml(messageId, r, allRealmEmojiById)).join('')}
    </div>
  `;
};
