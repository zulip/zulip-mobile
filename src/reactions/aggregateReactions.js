/* @flow */
import type { SlimEventReaction, AggregatedReaction } from '../types';
import codePointMap from '../emoji/codePointMap';

export default (reactions: SlimEventReaction[], ownEmail: string): AggregatedReaction[] =>
  Array.from(
    reactions
      .reduce((reactionMap, x) => {
        if (!reactionMap.has(x.emoji_name)) {
          reactionMap.set(x.emoji_name, {
            code: codePointMap[x.emoji_name],
            count: 1,
            name: x.emoji_name,
            type: 'unicode_emoji',
            selfReacted: false,
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
