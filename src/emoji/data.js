/* @flow strict-local */
import type { ImageEmojiType, EmojiType, ReactionType, EmojiForShared } from '../types';
import { objectFromEntries } from '../jsBackport';
import { unicodeCodeByName, override } from './codePointMap';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';
import objectEntries from '../utils/objectEntries';

const unicodeEmojiNames = Object.keys(unicodeCodeByName);

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
  activeImageEmojiByName: $ReadOnly<{| [string]: ImageEmojiType |}>,
): $ReadOnlyArray<EmojiForShared> => {
  // We start by making a map from matching emoji names to a number
  // representing how good a match it is: 0 for a prefix match, 1 for a
  // match anywhere else in the string.
  const allMatchingEmoji: Map<string, number> = new Map();
  for (const [emoji_name, emoji_code] of objectEntries(unicodeCodeByName)) {
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
    const matchesEmojiLiteral = parseUnicodeEmojiCode(emoji_code) === query;
    const matchesEmojiName = Math.min(1, emoji_name.indexOf(query));
    const priority = matchesEmojiLiteral ? 0 : matchesEmojiName;
    if (priority !== -1) {
      allMatchingEmoji.set(emoji_name, priority);
    }
  }

  for (const emoji_name of Object.keys(activeImageEmojiByName)) {
    const priority = Math.min(1, emoji_name.indexOf(query));
    if (priority !== -1) {
      allMatchingEmoji.set(emoji_name, priority);
    }
  }

  const emoji = Array.from(allMatchingEmoji.keys()).sort((a, b) => {
    // `.get` will never return `undefined` here, but Flow doesn't know that
    const n = +allMatchingEmoji.get(a) - +allMatchingEmoji.get(b);
    // Prefix matches first, then non-prefix, each in lexicographic order.
    return n !== 0 ? n : a < b ? -1 : 1;
  });

  return emoji.map(emojiName => {
    const isImageEmoji = activeImageEmojiByName[emojiName] !== undefined;
    return {
      emoji_name: emojiName,
      emoji_type: isImageEmoji ? 'image' : 'unicode',
      emoji_code: isImageEmoji
        ? activeImageEmojiByName[emojiName].code
        : unicodeCodeByName[emojiName],
    };
  });
};
