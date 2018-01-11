/* @flow */
import { createSelector } from 'reselect';
import { getRealmEmoji } from '../selectors';

export const getActiveRealmEmoji = createSelector(getRealmEmoji, emojis =>
  Object.keys(emojis)
    .filter(emoji => !emojis[emoji].deactivated)
    .reduce((list, key) => {
      list[key] = emojis[key];
      return list;
    }, {}),
);
