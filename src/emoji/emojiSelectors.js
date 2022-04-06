/* @flow strict-local */
import { createSelector } from 'reselect';
import type { Selector, RealmEmojiById, ImageEmojiType, EmojiForShared } from '../types';
import { getRawRealmEmoji } from '../directSelectors';
import { getIdentity } from '../account/accountsSelectors';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';
import { objectFromEntries } from '../jsBackport';

export const getAllImageEmojiById: Selector<RealmEmojiById> = createSelector(
  getIdentity,
  getRawRealmEmoji,
  (identity, realmEmoji) => {
    const result: {| [string]: ImageEmojiType |} = {};
    [realmEmoji, zulipExtraEmojiMap].forEach(emojis => {
      Object.keys(emojis).forEach(id => {
        result[id] = {
          ...emojis[id],
          source_url: new URL(emojis[id].source_url, identity.realm).toString(),
        };
      });
    });
    return result;
  },
);

export const getActiveImageEmojiById: Selector<RealmEmojiById> = createSelector(
  getAllImageEmojiById,
  emojis => {
    const result: {| [string]: ImageEmojiType |} = {};
    Object.keys(emojis).forEach(id => {
      if (!emojis[id].deactivated) {
        result[id] = emojis[id];
      }
    });
    return result;
  },
);

export const getAllImageEmojiByCode: Selector<{|
  [string]: ImageEmojiType,
|}> = createSelector(getAllImageEmojiById, emojis =>
  objectFromEntries(Object.keys(emojis).map(id => [emojis[id].code, emojis[id]])),
);

export const getActiveImageEmojiByName: Selector<{|
  [string]: ImageEmojiType,
|}> = createSelector(getActiveImageEmojiById, emojis =>
  objectFromEntries(Object.keys(emojis).map(id => [emojis[id].name, emojis[id]])),
);

export const getActiveImageEmoji: Selector<$ReadOnlyArray<EmojiForShared>> = createSelector(
  getActiveImageEmojiById,
  emojis =>
    Object.keys(emojis).map(id => ({
      emoji_type: 'image',
      emoji_name: emojis[id].name,
      emoji_code: emojis[id].code,
    })),
);
