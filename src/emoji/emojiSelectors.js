/* @flow strict-local */
import { createSelector } from 'reselect';
import type { Selector, ImageEmoji, ImageEmojiById, EmojiForShared } from '../types';
import { getRawRealmEmoji } from '../directSelectors';
import { getIdentity } from '../account/accountsSelectors';
import zulipExtraEmojiMap from './zulipExtraEmojiMap';
import { objectFromEntries } from '../jsBackport';
import type { ReadWrite } from '../generics';
import { objectEntries } from '../flowPonyfill';

export const getAllImageEmojiById: Selector<ImageEmojiById> = createSelector(
  getIdentity,
  getRawRealmEmoji,
  (identity, realmEmoji) => {
    const result: ReadWrite<ImageEmojiById> = {};
    objectEntries(realmEmoji).forEach(([id, emoji]) => {
      result[id] = {
        ...emoji,
        reaction_type: 'realm_emoji',
        source_url: new URL(emoji.source_url, identity.realm).toString(),
      };
    });
    objectEntries(zulipExtraEmojiMap).forEach(([id, emoji]) => {
      result[id] = {
        ...emoji,
        source_url: new URL(emoji.source_url, identity.realm).toString(),
      };
    });
    return result;
  },
);

export const getActiveImageEmojiById: Selector<ImageEmojiById> = createSelector(
  getAllImageEmojiById,
  emojis => {
    const result: ReadWrite<ImageEmojiById> = {};
    Object.keys(emojis).forEach(id => {
      if (!emojis[id].deactivated) {
        result[id] = emojis[id];
      }
    });
    return result;
  },
);

export const getAllImageEmojiByCode: Selector<{|
  [string]: ImageEmoji,
|}> = createSelector(getAllImageEmojiById, emojis =>
  objectFromEntries(Object.keys(emojis).map(id => [emojis[id].code, emojis[id]])),
);

export const getActiveImageEmoji: Selector<$ReadOnlyArray<EmojiForShared>> = createSelector(
  getActiveImageEmojiById,
  emojis =>
    objectEntries(emojis).map(([id, emoji]) => ({
      emoji_type: 'image',
      reaction_type: emoji.reaction_type,
      emoji_name: emoji.name,
      emoji_code: emoji.code,
    })),
);
