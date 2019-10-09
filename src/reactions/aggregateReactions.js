/* @flow strict-local */
import type { Reaction, AggregatedReaction } from '../types';

export default (
  reactions: $ReadOnlyArray<Reaction>,
  ownUserId: number,
): $ReadOnlyArray<AggregatedReaction> => {
  const reactionMap = new Map();
  reactions.forEach(x => {
    let item = reactionMap.get(x.emoji_name);
    if (!item) {
      item = {
        name: x.emoji_name,
        type: x.reaction_type,
        code: x.emoji_code,
        count: 0,
        selfReacted: false,
      };
      reactionMap.set(x.emoji_name, item);
    }

    item.count += 1;
    if (x.user_id === ownUserId) {
      item.selfReacted = true;
    }
  });
  return Array.from(reactionMap.values());
};
