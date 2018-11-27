/* @flow strict-local */
import 'string.fromcodepoint'; // eslint-disable-line spellcheck/spell-checker

import type { RealmEmojiType } from '../types';
import { unicodeCodeByName, override } from './codePointMap';

const unicodeEmojiNames = Object.keys(unicodeCodeByName);

export const nameToEmojiMap = unicodeEmojiNames.reduce((obj, name) => {
  obj[name] = String.fromCodePoint(parseInt(unicodeCodeByName[name], 16));
  return obj;
}, ({}: { [string]: string }));

export const codeToEmojiMap = unicodeEmojiNames.reduce((obj, name) => {
  const code = unicodeCodeByName[name];
  const displayCode = override[code] || code;
  obj[code] = String.fromCodePoint(parseInt(displayCode, 16));
  return obj;
}, ({}: { [string]: string }));

export const getFilteredEmojiNames = (
  query: string,
  activeRealmEmojiByName: { [string]: RealmEmojiType },
): string[] => {
  const names = [...unicodeEmojiNames, ...Object.keys(activeRealmEmojiByName)];
  return Array.from(new Set([...names.filter(x => x.indexOf(query) === 0).sort()]));
};
