/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import config from '../config';
import { getNav, getAccounts } from '../directSelectors';
import { getAuth } from '../account/accountSelectors';
import AppNavigator from './AppNavigator';

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

export const getStateForRoute = (route: string, params?: Object) =>
  AppNavigator.router.getStateForAction(
    AppNavigator.router.getActionForPathAndParams(route, params),
  );

export const getInitialNavState = createSelector(
  getNav,
  getAccounts,
  getAuth,
  (nav, accounts, auth) => {
    if (!auth.apiKey) {
      return getStateForRoute(accounts && accounts.length > 1 ? 'account' : 'realm');
    }

    const state =
      nav.routes.length === 1 && nav.routes[0].routeName === 'loading'
        ? getStateForRoute('main')
        : nav;

    if (config.startup.narrow) {
      state.routes.push(
        AppNavigator.router.getActionForPathAndParams('chat', { narrow: config.startup.narrow }),
      );
      state.index++;
    }

    return state;
  },
);
