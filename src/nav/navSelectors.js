/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import { getNav, getAccounts } from '../directSelectors';
import { getAuth } from '../account/accountSelectors';
import AppNavigator from './AppNavigator';

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

export const getStateForRoute = (route: string) =>
  AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams(route));

export const getInitialRoute = createSelector(
  getNav,
  getAccounts,
  getAuth,
  (nav, accounts, auth) => {
    if (auth.apiKey) {
      return nav.routes.length === 1 && nav.routes[0].routeName === 'loading'
        ? getStateForRoute('main')
        : nav;
    }

    return getStateForRoute(accounts && accounts.length > 1 ? 'account' : 'realm');
  },
);
