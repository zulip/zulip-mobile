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

const sortEmojiByQueryName = (
  emoji: Array<string>,
  query: string
): string[] => emoji.sort(
  (a, b) => {
    if (a.indexOf(query) !== b.indexOf(query)) {
       return a.indexOf(query) - b.indexOf(query);
    } else { return (a > b ? 1 : -1); }
  }
);

export const getFilteredEmojiNames = (
  query: string,
  activeRealmEmojiByName: $ReadOnly<{ [string]: ImageEmojiType }>,
): string[] => {
  const names = [...unicodeEmojiNames, ...Object.keys(activeRealmEmojiByName)];
  const emoji = Array.from(new Set(
    [...names.filter(x => x.includes(query))])
  );
  return sortEmojiByQueryName(emoji, query);
};
