/* @flow strict-local */
import 'string.fromcodepoint'; // eslint-disable-line spellcheck/spell-checker

import type { RealmEmojiType } from '../types';
import { unicodeCodeByName, override } from './codePointMap';

export const nameToEmojiMap = Object.keys(unicodeCodeByName).reduce((obj, name) => {
  obj[name] = String.fromCodePoint(parseInt(unicodeCodeByName[name], 16));
  return obj;
}, ({}: { [string]: string }));

export const codeToEmojiMap = Object.keys(unicodeCodeByName).reduce((obj, name) => {
  const code = unicodeCodeByName[name];
  const displayCode = override[code] || code;
  obj[code] = String.fromCodePoint(parseInt(displayCode, 16));
  return obj;
}, ({}: { [string]: string }));

export const getFilteredEmojiNames = (
  query: string,
  activeRealmEmojiByName: { [string]: RealmEmojiType },
): string[] => {
  const names = [...Object.keys(unicodeCodeByName), ...Object.keys(activeRealmEmojiByName)];
  return Array.from(new Set([...names.filter(x => x.indexOf(query) === 0).sort()]));
};
