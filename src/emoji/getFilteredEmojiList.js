/* @flow */
import emojiMap from './emojiMap';
import type { RealmEmoji } from '../types';

export default (query: string, realmEmoji: RealmEmoji) =>
  Array.from(
    new Set([
      ...Object.keys(emojiMap)
        .filter(x => x.indexOf(query) === 0)
        .sort(),
      ...Object.keys(realmEmoji).filter(emoji => emoji.startsWith(query)),
      ...Object.keys(realmEmoji).filter(emoji => emoji.includes(query)),
    ]),
  );
