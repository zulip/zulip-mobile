/* @flow */
import { createSelector } from 'reselect';

import { getAccounts, getAuth } from '../account/accountSelectors';
import AppNavigator from './AppNavigator';

export const getStateForRoute = (route: string) =>
  AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams(route));

export const getInitialRoute = createSelector(getAccounts, getAuth, (accounts, auth) => {
  if (auth.apiKey) {
    return 'main';
  }

  return accounts.length > 1 ? 'account' : 'realm';
});
