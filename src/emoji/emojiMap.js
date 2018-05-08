/* @flow */
/* eslint-disable */
import 'string.fromcodepoint';

import codePointMap from './codePointMap';

export const nameToEmojiMap = Object.keys(codePointMap).reduce((obj, key) => {
  obj[key] = String.fromCodePoint(parseInt(codePointMap[key], 16));
  return obj;
}, {});

export const codeToEmojiMap = Object.values(codePointMap).reduce((obj, key) => {
  // $FlowFixMe
  obj[key] = String.fromCodePoint(parseInt(key, 16));
  return obj;
}, {});

export default nameToEmojiMap;
