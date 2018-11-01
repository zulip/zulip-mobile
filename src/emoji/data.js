/* @flow strict-local */
import 'string.fromcodepoint'; // eslint-disable-line spellcheck/spell-checker

import type { EmojiNameToCodePoint, RealmEmojiType } from '../types';
import { override } from './codePointMap';

const parseUnicodeEmojiCode = (code: string): string /* force line */ =>
  code
    .split('-')
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join('');

export const nameToEmojiMap = (codePointMap: EmojiNameToCodePoint) =>
  Object.keys(codePointMap).reduce((obj, name) => {
    obj[name] = parseUnicodeEmojiCode(codePointMap[name]);
    return obj;
  }, ({}: { [string]: string }));

export const codeToEmojiMap = (codePointMap: EmojiNameToCodePoint) =>
  Object.keys(codePointMap).reduce((obj, name) => {
    const code = codePointMap[name];
    const displayCode = override[code] || code;
    obj[code] = parseUnicodeEmojiCode(displayCode);
    return obj;
  }, ({}: { [string]: string }));

export const getFilteredEmojiNames = (
  query: string,
  activeRealmEmojiByName: $ReadOnly<{ [string]: RealmEmojiType }>,
  codePointMap: EmojiNameToCodePoint,
): string[] => {
  const names = [...Object.keys(codePointMap), ...Object.keys(activeRealmEmojiByName)];
  return Array.from(new Set([...names.filter(x => x.indexOf(query) === 0).sort()]));
};
