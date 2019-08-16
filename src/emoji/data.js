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

export const nameToEmojiMap = unicodeEmojiNames.reduce((obj, name) => {
  obj[name] = parseUnicodeEmojiCode(unicodeCodeByName[name]);
  return obj;
}, ({}: { [string]: string }));

export const codeToEmojiMap = unicodeEmojiNames.reduce((obj, name) => {
  const code = unicodeCodeByName[name];
  const displayCode = override[code] || code;
  obj[code] = parseUnicodeEmojiCode(displayCode);
  return obj;
}, ({}: { [string]: string }));

export const getFilteredEmojiNames = (
  query: string,
  activeRealmEmojiByName: $ReadOnly<{ [string]: ImageEmojiType }>,
): string[] => {
  const names = [...unicodeEmojiNames, ...Object.keys(activeRealmEmojiByName)];
  return Array.from(new Set([...names.filter(x => x.indexOf(query) === 0).sort()]));
};
