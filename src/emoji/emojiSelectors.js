/* @flow strict-local */
import { createSelector } from 'reselect';
import type { Selector, RealmEmojiState, RealmEmojiType } from '../types';
import { getRawRealmEmoji } from '../directSelectors';
import { getIdentity } from '../account/accountsSelectors';
import { getFullUrl } from '../utils/url';

export const getAllRealmEmojiById: Selector<RealmEmojiState> = createSelector(
  getIdentity,
  getRawRealmEmoji,
  (identity, emojis) =>
    Object.keys(emojis).reduce((result, id) => {
      result[id] = { ...emojis[id], source_url: getFullUrl(emojis[id].source_url, identity.realm) };
      return result;
    }, {}),
);

export const getActiveRealmEmojiById: Selector<RealmEmojiState> = createSelector(
  getAllRealmEmojiById,
  emojis =>
    Object.keys(emojis)
      .filter(id => !emojis[id].deactivated)
      .reduce((result, id) => {
        result[id] = emojis[id];
        return result;
      }, {}),
);

export const getAllRealmEmojiByName: Selector<{ [string]: RealmEmojiType }> = createSelector(
  getAllRealmEmojiById,
  emojis =>
    Object.keys(emojis).reduce((result, id) => {
      result[emojis[id].name] = emojis[id];
      return result;
    }, {}),
);

export const getActiveRealmEmojiByName: Selector<{ [string]: RealmEmojiType }> = createSelector(
  getActiveRealmEmojiById,
  emojis =>
    Object.keys(emojis).reduce((result, id) => {
      result[emojis[id].name] = emojis[id];
      return result;
    }, {}),
);
