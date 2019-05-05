/* @flow strict-local */
import { createSelector } from 'reselect';
import type { Selector, RealmEmojiById, ImageEmojiType } from '../types';
import { getRawRealmEmoji } from '../directSelectors';
import { getIdentity } from '../account/accountsSelectors';
import { getFullUrl } from '../utils/url';
import zulipExtraEmojiMap from '../emoji/zulipExtraEmojiMap';

export const getAllImageEmojiById: Selector<RealmEmojiById> = createSelector(
  getIdentity,
  getRawRealmEmoji,
  (identity, realmEmoji) => {
    const result = {};
    [realmEmoji, zulipExtraEmojiMap].forEach(emojis => {
      Object.keys(emojis).forEach(id => {
        result[id] = {
          ...emojis[id],
          source_url: getFullUrl(emojis[id].source_url, identity.realm),
        };
      });
    });
    return result;
  },
);

export const getActiveImageEmojiById: Selector<RealmEmojiById> = createSelector(
  getAllImageEmojiById,
  emojis =>
    Object.keys(emojis)
      .filter(id => !emojis[id].deactivated)
      .reduce((result, id) => {
        result[id] = emojis[id];
        return result;
      }, {}),
);

export const getAllImageEmojiByName: Selector<{ [string]: ImageEmojiType }> = createSelector(
  getAllImageEmojiById,
  emojis =>
    Object.keys(emojis).reduce((result, id) => {
      result[emojis[id].name] = emojis[id];
      return result;
    }, {}),
);

export const getActiveImageEmojiByName: Selector<{ [string]: ImageEmojiType }> = createSelector(
  getActiveImageEmojiById,
  emojis =>
    Object.keys(emojis).reduce((result, id) => {
      result[emojis[id].name] = emojis[id];
      return result;
    }, {}),
);
