/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { getAccounts } from '../directSelectors';
import { getAuth } from '../account/accountSelectors';
import AppNavigator from './AppNavigator';

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

export const getStateForRoute = (route: string) =>
  AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams(route));

export const getInitialRoute = createSelector(getAccounts, getAuth, (accounts, auth) => {
  if (auth.apiKey) {
    return 'main';
  }

  return accounts && accounts.length > 1 ? 'account' : 'realm';
});
