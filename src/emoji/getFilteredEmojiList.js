/* @flow */
import emojiMap from './emojiMap';
import type { RealmEmojiState, ZulipExtraEmojisState } from '../types';

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

export default (
  query: string,
  realmEmojiState: RealmEmojiState,
  zulipExtraEmojis: ZulipExtraEmojisState,
) =>
  Array.from(
    new Set(
      [
        ...Object.keys(emojiMap)
          .filter(x => x.indexOf(query) === 0)
          .sort(),
        ...Object.keys(zulipExtraEmojis).filter(key => key.startsWith(query)),
        ...Object.keys(zulipExtraEmojis).filter(key => key.includes(query)),
      ]
        .concat(getRealmEmojiWhichStartsWith(query, realmEmojiState))
        .concat(getRealmEmojiWhichIncludes(query, realmEmojiState)),
    ),
  );
