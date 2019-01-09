/* @flow strict-local */
import { createSelector } from 'reselect';
import type { Selector, RealmEmojiById, ImageEmojiType } from '../types';
import { getRawRealmEmoji } from '../directSelectors';
import { getIdentity } from '../account/accountsSelectors';
import { getFullUrl } from '../utils/url';

export const getAllRealmEmojiById: Selector<RealmEmojiById> = createSelector(
  getIdentity,
  getRawRealmEmoji,
  (identity, emojis) =>
    Object.keys(emojis).reduce((result, id) => {
      result[id] = { ...emojis[id], source_url: getFullUrl(emojis[id].source_url, identity.realm) };
      return result;
    }, {}),
);

export const getActiveRealmEmojiById: Selector<RealmEmojiById> = createSelector(
  getAllRealmEmojiById,
  emojis =>
    Object.keys(emojis)
      .filter(id => !emojis[id].deactivated)
      .reduce((result, id) => {
        result[id] = emojis[id];
        return result;
      }, {}),
);

export const getAllRealmEmojiByName: Selector<{ [string]: ImageEmojiType }> = createSelector(
  getAllRealmEmojiById,
  emojis =>
    Object.keys(emojis).reduce((result, id) => {
      result[emojis[id].name] = emojis[id];
      return result;
    }, {}),
);

export const getActiveRealmEmojiByName: Selector<{ [string]: ImageEmojiType }> = createSelector(
  getActiveRealmEmojiById,
  emojis =>
    Object.keys(emojis).reduce((result, id) => {
      result[emojis[id].name] = emojis[id];
      return result;
    }, {}),
);
