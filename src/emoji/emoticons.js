/* @flow */
import emoticonMap from './emoticonMap';

export const replaceEmoticonsWithEmoji = (text: string): string =>
  text.replace(/[:;)(pP<3'-\\_xoO0cb|{‑%/]+/g, word => emoticonMap[word] || word);
