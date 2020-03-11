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

/**
 * Given a query-string, report all emoji whose names match that query-string.
 *
 * Names with the query-string earlier in the emoji name are given preference in
 * the returned list's sort-order.
 */
export const getFilteredEmojiNames = (
  query: string,
  activeImageEmojiByName: $ReadOnly<{ [string]: ImageEmojiType }>,
): string[] => {
  // Map from emoji names to the query's match-index. (Nonmatching names are
  // excluded.)
  const nameMap: Map<string, number> = new Map(
    [...unicodeEmojiNames, ...Object.keys(activeImageEmojiByName)]
      .map(x => [x, x.indexOf(query)])
      .filter(([_, i]) => i !== -1),
  );

  const emoji = Array.from(nameMap.keys()).sort((a, b) => {
    // `.get` will never return `undefined` here, but Flow doesn't know that
    const n = +nameMap.get(a) - +nameMap.get(b);
    return n !== 0 ? n : a < b ? -1 : 1;
  });

  return emoji;
};
