/* @flow */
import emojiMap from './emojiMap';
import type { RealmEmoji } from '../types';

export default (query: string, realmEmoji: RealmEmoji) =>
  // TODO: this doesn't actually handle realm emoji.  See our issue #2846.
  Array.from(
    new Set([
      ...Object.keys(emojiMap)
        .filter(x => x.indexOf(query) === 0)
        .sort(),
    ]),
  );
