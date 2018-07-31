/* @flow */
import emojiMap from './emojiMap';
import type { RealmEmojiType } from '../types';

export default (query: string, activeRealmEmojiByName: { [string]: RealmEmojiType }) =>
  Array.from(
    new Set([
      ...Object.keys(emojiMap)
        .filter(x => x.indexOf(query) === 0)
        .sort(),
      ...Object.keys(activeRealmEmojiByName).filter(emoji => emoji.startsWith(query)),
      ...Object.keys(activeRealmEmojiByName).filter(emoji => emoji.includes(query)),
    ]),
  );
