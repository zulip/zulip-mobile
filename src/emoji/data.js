/* @flow strict-local */
import 'string.fromcodepoint'; // eslint-disable-line spellcheck/spell-checker

import type { RealmEmojiType } from '../types';
import { codePointMap, override } from './codePointMap';

export const nameToEmojiMap = Object.keys(codePointMap).reduce((obj, name) => {
  obj[name] = String.fromCodePoint(parseInt(codePointMap[name], 16));
  return obj;
}, ({}: { [string]: string }));

export const codeToEmojiMap = Object.keys(codePointMap).reduce((obj, name) => {
  const code = codePointMap[name];
  const displayCode = override[code] || code;
  obj[code] = String.fromCodePoint(parseInt(displayCode, 16));
  return obj;
}, ({}: { [string]: string }));

export const getFilteredEmojiList = (
  query: string,
  activeRealmEmojiByName: { [string]: RealmEmojiType },
): string[] =>
  // TODO: this doesn't actually handle realm emoji.  See our issue #2846.
  Array.from(
    new Set([
      ...Object.keys(nameToEmojiMap)
        .filter(x => x.indexOf(query) === 0)
        .sort(),
    ]),
  );
