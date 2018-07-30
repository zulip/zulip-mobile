/* @flow */
import emojiMap from './emojiMap';
import type { RealmEmojiType } from '../types';

export default (query: string, realmEmoji: { [string]: RealmEmojiType }) =>
  Array.from(
    new Set([
      ...Object.keys(emojiMap)
        .filter(x => x.indexOf(query) === 0)
        .sort(),
      ...Object.keys(realmEmoji).filter(emoji => emoji.startsWith(query)),
      ...Object.keys(realmEmoji).filter(emoji => emoji.includes(query)),
    ]),
  );
