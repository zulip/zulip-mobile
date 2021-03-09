/* @flow strict-local */
import 'string.fromcodepoint';

import type { ImageEmojiType, EmojiType } from '../types';
import { objectFromEntries } from '../jsBackport';
import { unicodeCodeByName, override } from './codePointMap';
import objectEntries from '../utils/objectEntries';

const unicodeEmojiNames = Object.keys(unicodeCodeByName);

export const parseUnicodeEmojiCode = (code: string): string /* force line */ =>
  code
    .split('-')
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join('');

export const codeToEmojiMap = objectFromEntries<string, string>(
  unicodeEmojiNames.map(name => {
    const code = unicodeCodeByName[name];
    const displayCode = override[code] || code;
    return [code, parseUnicodeEmojiCode(displayCode)];
  }),
);

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
): $ReadOnlyArray<{| emoji_type: EmojiType, name: string, code: string |}> => {
  // We start by making a map from matching emoji names to a number
  // representing how good a match it is: 0 for a prefix match, 1 for a
  // match anywhere else in the string.

  const matchingUnicodeEmoji = objectEntries(unicodeCodeByName)
    .map(([name, code]) => {
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
      const matchesEmojiLiteral = parseUnicodeEmojiCode(code) === query;
      const matchesEmojiName = Math.min(1, name.indexOf(query));
      return [name, matchesEmojiLiteral ? 0 : matchesEmojiName];
    })
    .filter(([_, i]) => i !== -1);

  const matchingImageEmoji = Object.keys(activeImageEmojiByName)
    .map(x => [x, Math.min(1, x.indexOf(query))])
    .filter(([_, i]) => i !== -1);

  const allMatchingEmoji: Map<string, number> = new Map([
    ...matchingUnicodeEmoji,
    ...matchingImageEmoji,
  ]);

  const emoji = Array.from(allMatchingEmoji.keys()).sort((a, b) => {
    // `.get` will never return `undefined` here, but Flow doesn't know that
    const n = +allMatchingEmoji.get(a) - +allMatchingEmoji.get(b);
    // Prefix matches first, then non-prefix, each in lexicographic order.
    return n !== 0 ? n : a < b ? -1 : 1;
  });

  return emoji.map(emojiName => {
    const isImageEmoji = activeImageEmojiByName[emojiName] !== undefined;
    return {
      name: emojiName,
      emoji_type: isImageEmoji ? 'image' : 'unicode',
      code: isImageEmoji ? activeImageEmojiByName[emojiName].code : unicodeCodeByName[emojiName],
    };
  });
};
