/* @flow strict-local */
import emojiMap from './emojiMap';
import type { RealmEmojiType } from '../types';

export default (query: string, realmEmoji: { [string]: RealmEmojiType }): string[] =>
  // TODO: this doesn't actually handle realm emoji.  See our issue #2846.
  Array.from(
    new Set([
      ...Object.keys(emojiMap)
        .filter(x => x.indexOf(query) === 0)
        .sort(),
    ]),
  );
