/* @flow */
import { createSelector } from 'reselect';
import { getRawRealmEmoji } from '../directSelectors';
import { getAuth } from '../account/accountSelectors';
import { getFullUrl } from '../utils/url';

export const getAllRealmEmojiById = createSelector(getAuth, getRawRealmEmoji, (auth, emojis) =>
  Object.keys(emojis).reduce((result, id) => {
    result[id] = { ...emojis[id], source_url: getFullUrl(emojis[id].source_url, auth.realm) };
    return result;
  }, {}),
);

export const getActiveRealmEmojiById = createSelector(getAllRealmEmojiById, emojis =>
  Object.keys(emojis)
    .filter(id => !emojis[id].deactivated)
    .reduce((result, id) => {
      result[id] = emojis[id];
      return result;
    }, {}),
);
