/* @flow */
import type { EventReaction, RealmEmojiState } from '../../types';
import aggregateReactions from '../../reactions/aggregateReactions';
import template from './template';
import messageReactionAsHtml from './messageReactionAsHtml';

export default (
  reactions: EventReaction[],
  messageId: number,
  ownEmail: string,
  allRealmEmojiByName: RealmEmojiState,
): string => {
  if (!reactions || reactions.length === 0) {
    return '';
  }

  const aggregated = aggregateReactions(reactions, ownEmail);

  return template`
    <div class="reaction-list">
      $!${aggregated.map(r => messageReactionAsHtml(messageId, r, allRealmEmojiByName)).join('')}
    </div>
  `;
};
