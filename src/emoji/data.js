/* @flow strict-local */
import * as typeahead from '@zulip/shared/js/typeahead';

import type { EmojiType, ReactionType, EmojiForShared } from '../types';
import { objectFromEntries } from '../jsBackport';
import { unicodeCodeByName, override } from './codePointMap';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';
import objectEntries from '../utils/objectEntries';

const unicodeEmojiNames = Object.keys(unicodeCodeByName);

const unicodeEmojiObjects: $ReadOnlyArray<EmojiForShared> = objectEntries(unicodeCodeByName).map(
  ([name, code]) => ({
    emoji_type: 'unicode',
    emoji_name: name,
    emoji_code: code,
  }),
);

export const parseUnicodeEmojiCode = (code: string): string /* force line */ =>
  code
    .split('-')
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join('');

export const codeToEmojiMap: {| [string]: string |} = objectFromEntries<string, string>(
  unicodeEmojiNames.map(name => {
    const code = unicodeCodeByName[name];
    const displayCode = override[code] || code;
    return [code, parseUnicodeEmojiCode(displayCode)];
  }),
);

// TODO(?): Stop having distinct `EmojiType` and `ReactionType`; confusing?
//   https://github.com/zulip/zulip-mobile/pull/5269#discussion_r818320669
export const reactionTypeFromEmojiType = (emojiType: EmojiType, name: string): ReactionType =>
  emojiType === 'image'
    ? zulipExtraEmojiMap[name]
      ? 'zulip_extra_emoji'
      : 'realm_emoji'
    : 'unicode_emoji';

// See comment on reactionTypeFromEmojiType, just above.
export const emojiTypeFromReactionType = (reactionType: ReactionType): EmojiType =>
  reactionType === 'unicode_emoji' ? 'unicode' : 'image';

/**
 * A list of emoji matching the query, in an order to offer to the user.
 *
 * Note that the same emoji may appear multiple times under different names.
 * This allows the user to choose which name to use; the chosen name is the
 * one that e.g. is shown to other users on hovering on a reaction.
 *
 * For example, 🗽, the Unicode emoji with code '1f5fd', has the names
 * :new_york:, :statue:, and :statue_of_liberty:, and a search like "statu"
 * or "🗽" itself will return two or all three of those, respectively.
 */
export const getFilteredEmojis = (
  query: string,
  activeImageEmoji: $ReadOnlyArray<EmojiForShared>,
): $ReadOnlyArray<EmojiForShared> => {
  const allMatchingEmoji: Map<string, EmojiForShared> = new Map();
  for (const emoji of unicodeEmojiObjects) {
    // This logic does not do any special handling for things like
    // skin-tone modifiers or gender modifiers, since Zulip does not
    // currently support those: https://github.com/zulip/zulip/issues/992.
    // Once support is added for that, we may want to come back here and
    // modify this logic, if for instance, there is a default skin-tone
    // setting in the webapp that we want to also surface here. (or
    // perhaps it will be best to leave it as is - that's a product
    // decision that's yet to be made.) For the time being, it seems
    // better to not show the user anything if they've searched for an
    // emoji with a modifier than it is to show them the non-modified
    // emoji, hence the very simple matching.
    const matchesEmojiLiteral = parseUnicodeEmojiCode(emoji.emoji_code) === query;
    const matchesEmojiName = Math.min(1, emoji.emoji_name.indexOf(query));
    const priority = matchesEmojiLiteral ? 0 : matchesEmojiName;
    if (priority !== -1) {
      allMatchingEmoji.set(emoji.emoji_name, emoji);
    }
  }

  for (const emoji of activeImageEmoji) {
    const priority = Math.min(1, emoji.emoji_name.indexOf(query));
    if (priority !== -1) {
      allMatchingEmoji.set(emoji.emoji_name, emoji);
    }
  }

  const sortedEmoji = typeahead.sort_emojis(Array.from(allMatchingEmoji.values()), query);

  return sortedEmoji;
};
