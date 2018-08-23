/* @flow */
/* eslint-disable */
import 'string.fromcodepoint';

import codePointMap from './codePointMap';

export const nameToEmojiMap = Object.keys(codePointMap).reduce((obj, name) => {
  obj[name] = String.fromCodePoint(parseInt(codePointMap[name], 16));
  return obj;
}, ({}: { [string]: string }));

export const codeToEmojiMap = Object.keys(codePointMap).reduce((obj, name) => {
  obj[name] = String.fromCodePoint(parseInt(codePointMap[name], 16));
  return obj;
}, ({}: { [string]: string }));

export default nameToEmojiMap;
