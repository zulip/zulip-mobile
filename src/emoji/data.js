/* @flow strict-local */
import 'string.fromcodepoint'; // eslint-disable-line spellcheck/spell-checker

import type { ImageEmojiType } from '../types';
import { unicodeCodeByName, override } from './codePointMap';

const unicodeEmojiNames = Object.keys(unicodeCodeByName);

const parseUnicodeEmojiCode = (code: string): string /* force line */ =>
  code
    .split('-')
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join('');

/**
 * Backport of `Object.fromEntries`.
 *
 * See documentation on MDN:
 *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
 *
 * This version requires an `Array` just because that was easiest to
 * implement and is all we happened to need.  Would be nice to extend to
 * iterables.
 */
function objectFromEntries<+T>(entries: $ReadOnlyArray<[string, T]>): { [string]: T } {
  const obj = ({}: { [string]: T });
  entries.forEach(entry => {
    // ESLint bug?  I don't understand how this rule even applies to this line.
    // eslint-disable-next-line prefer-destructuring
    obj[entry[0]] = entry[1];
  });
  return obj;
}

export const nameToEmojiMap = objectFromEntries<string>(
  unicodeEmojiNames.map(name => [name, parseUnicodeEmojiCode(unicodeCodeByName[name])]),
);

export const codeToEmojiMap = objectFromEntries<string>(
  unicodeEmojiNames.map(name => {
    const code = unicodeCodeByName[name];
    const displayCode = override[code] || code;
    return [code, parseUnicodeEmojiCode(displayCode)];
  }),
);

export const getFilteredEmojiNames = (
  query: string,
  activeRealmEmojiByName: $ReadOnly<{ [string]: ImageEmojiType }>,
): string[] => {
  const names = [...unicodeEmojiNames, ...Object.keys(activeRealmEmojiByName)];
  return Array.from(new Set([...names.filter(x => x.indexOf(query) === 0).sort()]));
};
