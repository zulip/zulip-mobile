/* @flow */
import type { Auth, RealmEmojiType } from '../types';
import aggregateReactions from '../reactions/aggregateReactions';
import messageReactionAsHtml from './messageReactionAsHtml';

export default (
  auth: Auth,
  reactions: Object[],
  messageId: number,
  realmEmoji: RealmEmojiType[],
) => {
  if (!reactions || reactions.length === 0) {
    return '';
  }

  const aggregated = aggregateReactions(reactions, auth.email);

  return `
    <div class="reaction-list">
      ${aggregated
        .map(r => messageReactionAsHtml(messageId, r, realmEmoji, auth.realm || ''))
        .join('')}
    </div>
  `;
};
