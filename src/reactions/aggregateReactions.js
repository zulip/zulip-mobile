/* @flow */
import type { ReactionType } from '../types';

export default (reactions: ReactionType[], ownEmail: string): ReactionType[] =>
  Array.from(
    reactions
      .reduce((reactionMap, x) => {
        if (!reactionMap.has(x.emoji_name)) {
          reactionMap.set(x.emoji_name, {
            name: x.emoji_name,
            count: 1,
          });
        } else {
          const prevReaction = reactionMap.get(x.emoji_name);
          if (prevReaction) {
            reactionMap.set(x.emoji_name, {
              ...prevReaction,
              count: prevReaction.count + 1,
            });
          }
        }

        if (x.user && x.user.email === ownEmail) {
          reactionMap.set(x.emoji_name, {
            ...reactionMap.get(x.emoji_name),
            selfReacted: true,
          });
        }

        return reactionMap;
      }, new Map())
      .values(),
  );
