/* @flow */
import { createSelector } from 'reselect';
import type { Selector, RealmEmojiState } from '../types';
import { getRawRealmEmoji } from '../directSelectors';
import { getAuth } from '../account/accountSelectors';
import { getFullUrl } from '../utils/url';

export const getAllRealmEmojiById: Selector<RealmEmojiState> = createSelector(
  getAuth,
  getRawRealmEmoji,
  (auth, emojis) =>
    Object.keys(emojis).reduce((result, id) => {
      result[id] = { ...emojis[id], source_url: getFullUrl(emojis[id].source_url, auth.realm) };
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
