/* @flow */
import emojiMap from './emojiMap';
import type { RealmEmojiState } from '../types';

export const getRealmEmojiWhichStartsWith = (query: string, realmEmojiState: RealmEmojiState): [] =>
  Object.keys(realmEmojiState).reduce((filtered, key) => {
    if (realmEmojiState[key].name.startsWith(query)) {
      filtered.push(realmEmojiState[key].name);
    }
    return filtered;
  }, []);

export const getRealmEmojiWhichIncludes = (query: string, realmEmojiState: RealmEmojiState): [] =>
  Object.keys(realmEmojiState).reduce((filtered, key) => {
    if (realmEmojiState[key].name.includes(query)) {
      filtered.push(realmEmojiState[key].name);
    }
    return filtered;
  }, []);

export default (query: string, realmEmojiState: RealmEmojiState) =>
  Array.from(
    new Set(
      [
        ...Object.keys(emojiMap)
          .filter(x => x.indexOf(query) === 0)
          .sort(),
      ]
        .concat(getRealmEmojiWhichStartsWith(query, realmEmojiState))
        .concat(getRealmEmojiWhichIncludes(query, realmEmojiState)),
    ),
  );
