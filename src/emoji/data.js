/* @flow strict-local */
import { get_emoji_matcher, sort_emojis } from '@zulip/shared/js/typeahead';
import type { ImageEmojiType, EmojiType, ReactionType } from '../types';
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
): $ReadOnlyArray<{| emoji_type: EmojiType, name: string, code: string |}> => {
  const emojiMatcher = get_emoji_matcher(query);

  const matchingUnicodeEmojis = objectEntries(unicodeCodeByName)
    .map(([emoji_name, emoji_code]) => ({ emoji_name, emoji_code }))
    .filter(emoji => emojiMatcher(emoji) || parseUnicodeEmojiCode(emoji.emoji_code) === query);
  const matchingImageEmojis = objectEntries(activeImageEmojiByName)
    .map(([_, emoji]) => ({ emoji_name: emoji.name, emoji_code: emoji.code }))
    .filter(emoji => emojiMatcher(emoji));
  const allEmojis = [...matchingImageEmojis, ...matchingUnicodeEmojis];

  const uniqueEmojis = allEmojis.filter(
    (value, index, self) => index === self.findIndex(e => e.emoji_name === value.emoji_name),
  );
  const sortedEmojis = sort_emojis(uniqueEmojis, query);

  return sortedEmojis.map(emoji => {
    const isImageEmoji = activeImageEmojiByName[emoji.emoji_name] !== undefined;
    return {
      name: emoji.emoji_name,
      emoji_type: isImageEmoji ? 'image' : 'unicode',
      code: emoji.emoji_code,
    };
  });
};
