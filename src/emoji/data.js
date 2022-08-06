/* @flow strict-local */
import * as typeahead from '@zulip/shared/js/typeahead';

import * as api from '../api';
import * as logging from '../utils/logging';
import type {
  ThunkAction,
  PerAccountAction,
  ServerEmojiData,
  EmojiType,
  ReactionType,
  EmojiForShared,
} from '../types';
import { tryParseUrl } from '../utils/url';
import { REFRESH_SERVER_EMOJI_DATA } from '../actionConstants';
import { unicodeCodeByName, override } from './codePointMap';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';
import { objectEntries, objectValues } from '../flowPonyfill';
import { tryFetch } from '../message/fetchActions';
import { TimeoutError } from '../utils/async';

const refreshServerEmojiData = (data: ServerEmojiData): PerAccountAction => ({
  type: REFRESH_SERVER_EMOJI_DATA,
  data,
});

export const maybeRefreshServerEmojiData =
  (server_emoji_data_url: string | void): ThunkAction<Promise<void>> =>
  async (dispatch, getState) => {
    if (server_emoji_data_url === undefined) {
      // The server is too old to support this feature.
      // TODO(server-6.0): Simplify away; should always be present.
      return;
    }
    const parsedUrl = tryParseUrl(server_emoji_data_url);
    if (!parsedUrl) {
      logging.error('Invalid URL at server_emoji_data_url in /register response');
      return;
    }

    let data = undefined;
    try {
      data = await tryFetch(() => api.fetchServerEmojiData(parsedUrl), true);
    } catch (errorIllTyped) {
      const e: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470

      if (!(e instanceof Error)) {
        logging.error('Unexpected non-error thrown from api.fetchServerEmojiData');
        return;
      }

      if (e instanceof TimeoutError) {
        // Probably not a bug in client code; no need to log. Bad Internet
        // connection, probably, or the server's been giving 5xx errors,
        // which server admins should track.
        return;
      }

      // Likely client bug.
      logging.error(e);
      return;
    }

    dispatch(refreshServerEmojiData(data));
  };

const unicodeEmojiObjects: $ReadOnlyArray<EmojiForShared> = objectEntries(unicodeCodeByName).map(
  ([name, code]) => ({
    emoji_type: 'unicode',
    emoji_name: name,
    emoji_code: code,
  }),
);

/**
 * Convert a Unicode emoji's `emoji_code` into the actual Unicode codepoints.
 */
// Implemented to follow the comment on emoji_code in
//   https://github.com/zulip/zulip/blob/main/zerver/models.py :
//
// > * For Unicode emoji, [emoji_code is] a dash-separated hex encoding of
// >   the sequence of Unicode codepoints that define this emoji in the
// >   Unicode specification.  For examples, see "non_qualified" or
// >   "unified" in the following data, with "non_qualified" taking
// >   precedence when both present:
// >   https://raw.githubusercontent.com/iamcal/emoji-data/master/emoji_pretty.json
const parseUnicodeEmojiCode = (code: string): string /* force line */ =>
  code
    .split('-')
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join('');

export const availableUnicodeEmojiCodes: Set<string> = new Set(objectValues(unicodeCodeByName));

/**
 * From a Unicode emoji's `emoji_code`, give the actual character, like ✅.
 *
 * If the character isn't found, falls back to '?'.
 */
export const displayCharacterForUnicodeEmojiCode = (code: string): string =>
  availableUnicodeEmojiCodes.has(code) ? parseUnicodeEmojiCode(override[code] ?? code) : '?';

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
  const matcher = typeahead.get_emoji_matcher(query);
  const allMatchingEmoji: Map<string, EmojiForShared> = new Map();

  for (const emoji of unicodeEmojiObjects) {
    // TODO(shared): Use shared version of this feature too, once it exists.
    //   See PR: https://github.com/zulip/zulip/pull/21778
    //   and issue: https://github.com/zulip/zulip/issues/21714
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

    if (matchesEmojiLiteral || matcher(emoji)) {
      allMatchingEmoji.set(emoji.emoji_name, emoji);
    }
  }

  for (const emoji of activeImageEmoji) {
    if (matcher(emoji)) {
      allMatchingEmoji.set(emoji.emoji_name, emoji);
    }
  }

  return typeahead.sort_emojis(Array.from(allMatchingEmoji.values()), query);
};
