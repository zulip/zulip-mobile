/* @flow */
import { createSelector } from 'reselect';

import { NULL_OBJECT } from '../nullObjects';
import { getServerSettings } from '../directSelectors';
import { getCurrentRealm } from '../account/accountsSelectors';

export const getCurrentServerSettings = createSelector(
  getCurrentRealm,
  getServerSettings,
  (realm, serverSettings) => serverSettings[realm] || NULL_OBJECT,
);
