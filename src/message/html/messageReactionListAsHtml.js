import aggregateReactions from '../../reactions/aggregateReactions';
import messageReactionAsHtml from './messageReactionAsHtml';

export default (reactions: Object[], messageId: number, ownEmail: string) => {
  if (!reactions || reactions.length === 0) {
    return '';
  }

  const aggregated = aggregateReactions(reactions, ownEmail);

  return `
    <div class="reaction-list">
      ${aggregated
        .map(r => messageReactionAsHtml(messageId, r.name, r.count, r.selfReacted))
        .join('')}
    </div>
  `;
};
