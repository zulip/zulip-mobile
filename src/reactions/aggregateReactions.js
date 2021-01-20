/* @flow strict-local */
import type { Reaction, AggregatedReaction, UserId } from '../types';

export default (
  reactions: $ReadOnlyArray<Reaction>,
  ownUserId: UserId,
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
        users: [],
      };
      reactionMap.set(x.emoji_name, item);
    }

    item.count += 1;
    item.users.push(x.user_id);
    if (x.user_id === ownUserId) {
      item.selfReacted = true;
    }
  });
  return Array.from(reactionMap.values()).sort(
    (r1: AggregatedReaction, r2: AggregatedReaction) => r2.count - r1.count,
  );
};
