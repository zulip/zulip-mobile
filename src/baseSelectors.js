/* @flow */
import { createSelector } from 'reselect';

import { allPrivateNarrowStr } from './utils/narrow';
import { getAllMessages, getPresence } from './directSelectors';
import { NULL_ARRAY } from './nullObjects';
import config from './config';

export const getPrivateMessages = createSelector(
  getAllMessages,
  messages => messages[allPrivateNarrowStr] || NULL_ARRAY,
);

export const getValidPresence = createSelector(getPresence, presences => {
  const currentTime = Date.now() / 1000;
  const users = Object.keys(presences);
  return users.reduce((pre, email) => {
    const presence = presences[email];
    if (
      presence.aggregated &&
      currentTime - presence.aggregated.timestamp < config.offlineThresholdSecs
    ) {
      pre[email] = presences[email];
    }
    return pre;
  }, {});
});
