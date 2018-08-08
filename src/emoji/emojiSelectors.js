/* @flow */
import { createSelector } from 'reselect';
import { getRawRealmEmoji } from '../directSelectors';
import { getAuth } from '../account/accountSelectors';
import { getFullUrl } from '../utils/url';

export const getAllRealmEmojiById = createSelector(getAuth, getRawRealmEmoji, (auth, emojis) =>
  Object.keys(emojis).reduce((result, key) => {
    result[key] = { ...emojis[key], source_url: getFullUrl(emojis[key].source_url, auth.realm) };
    return result;
  }, {}),
);

export const getActiveRealmEmojiById = createSelector(getAllRealmEmojiById, emojis =>
  Object.keys(emojis)
    .filter(emoji => !emojis[emoji].deactivated)
    .reduce((result, key) => {
      result[key] = emojis[key];
      return result;
    }, {}),
);
