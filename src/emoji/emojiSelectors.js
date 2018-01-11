/* @flow */
import { createSelector } from 'reselect';
import { getRealmEmoji } from '../selectors';

export const getActiveRealmEmoji = createSelector(getRealmEmoji, emojis =>
  Object.keys(emojis).reduce((list, key) => {
    if (!emojis[key].deactivated) {
      list[key] = emojis[key];
    }
    return list;
  }, {}),
);
