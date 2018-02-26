/* @flow */
import { createSelector } from 'reselect';
import { getRealmEmoji } from '../directSelectors';
import { getAuth } from '../account/accountSelectors';
import { getFullUrl } from '../utils/url';

export const getAllRealmEmoji = createSelector(getAuth, getRealmEmoji, (auth, emojis) =>
  Object.keys(emojis).reduce((list, key) => {
    list[key] = { ...emojis[key], source_url: getFullUrl(emojis[key].source_url, auth.realm) };
    return list;
  }, {}),
);

export const getActiveRealmEmoji = createSelector(getAllRealmEmoji, emojis =>
  Object.keys(emojis)
    .filter(emoji => !emojis[emoji].deactivated)
    .reduce((list, key) => {
      list[key] = emojis[key];
      return list;
    }, {}),
);
