/* @flow strict-local */
import 'string.fromcodepoint'; // eslint-disable-line spellcheck/spell-checker

import type { ImageEmojiType } from '../types';
import { objectFromEntries } from '../jsBackport';
import { unicodeCodeByName, override } from './codePointMap';

const unicodeEmojiNames = Object.keys(unicodeCodeByName);

const parseUnicodeEmojiCode = (code: string): string /* force line */ =>
  code
    .split('-')
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join('');

export const nameToEmojiMap = objectFromEntries<string, string>(
  unicodeEmojiNames.map(name => [name, parseUnicodeEmojiCode(unicodeCodeByName[name])]),
);

export const codeToEmojiMap = objectFromEntries<string, string>(
  unicodeEmojiNames.map(name => {
    const code = unicodeCodeByName[name];
    const displayCode = override[code] || code;
    return [code, parseUnicodeEmojiCode(displayCode)];
  }),
);

export const getFilteredEmojiNames = (
  query: string,
  activeImageEmojiByName: $ReadOnly<{ [string]: ImageEmojiType }>,
): string[] => {
  // Check if the query itself is an emoji, and is known to Zulip. If
  // so, return the emoji name in an array. Emoji with single-codepoint and
  // multi-codepoint have length 2 and 3 respectively.
  if (query.length === 2) {
    const emojiName = unicodeEmojiNames.find(
      key => unicodeCodeByName[key] === query.codePointAt(0).toString(16),
    );
    if (emojiName !== undefined) {
      return [emojiName];
    }
  } else if (query.length === 3) {
    const emojiName = unicodeEmojiNames.find(
      key =>
        unicodeCodeByName[key]
        === `${query
          .codePointAt(0)
          .toString(16)
          .padStart(4, '0')}-${query
          .codePointAt(2)
          .toString(16)
          .padStart(4, '0')}`,
    );
    if (emojiName !== undefined) {
      return [emojiName];
    }
  }
  const names = [...unicodeEmojiNames, ...Object.keys(activeImageEmojiByName)];
  return Array.from(new Set([...names.filter(x => x.indexOf(query) === 0).sort()]));
};
