/* @flow */
import { createSelector } from 'reselect';
import isEqual from 'lodash.isequal';

import type { GlobalState } from '../types';
import config from '../config';
import { getNav, getAccounts } from '../directSelectors';
import { navigateToChat } from './navActions';
import { getAuth } from '../account/accountSelectors';
import AppNavigator from './AppNavigator';
import { getNarrowFromNotificationData } from '../utils/notificationsCommon';

export const getCanGoBack = (state: GlobalState) =>
  state.nav.index > 0 && state.nav.routes[state.nav.index].routeName !== 'lightbox';

export const getSameRoutesCount = createSelector(getNav, nav => {
  let i = nav.routes.length - 1;
  while (i >= 0) {
    if (nav.routes[i].routeName !== nav.routes[nav.routes.length - 1].routeName) {
      break;
    }
    i--;
  }
  return nav.routes.length - i - 1;
});

export const getSameRoutesAndParamsCount = createSelector(getNav, nav => {
  let i = nav.routes.length - 1;
  while (i >= 0) {
    if (
      nav.routes[i].routeName !== nav.routes[nav.routes.length - 1].routeName ||
      !isEqual(nav.routes[i].params, nav.routes[nav.routes.length - 1].params)
    ) {
      break;
    }
    i--;
  }
  return nav.routes.length - i - 1;
});

export const getPreviousDifferentRoute = createSelector(getNav, nav => {
  if (nav.routes.length < 2) return '';

  let i = nav.routes.length - 2;
  while (i >= 0 && nav.routes[i].routeName === nav.routes[nav.routes.length - 1].routeName) {
    i--;
  }

  return nav.routes[i < 0 ? 0 : i].key;
});

export const getPreviousDifferentRouteAndParams = createSelector(getNav, nav => {
  if (nav.routes.length < 2) return '';

  let i = nav.routes.length - 2;
  while (
    i >= 0 &&
    nav.routes[i].routeName === nav.routes[nav.routes.length - 1].routeName &&
    isEqual(nav.routes[i].params, nav.routes[nav.routes.length - 1].params)
  ) {
    i--;
  }

  return nav.routes[i < 0 ? 0 : i].key;
});

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
      !nav || (nav.routes.length === 1 && nav.routes[0].routeName === 'loading')
        ? getStateForRoute('main')
        : nav;

    if (!config.startup.notification) {
      return state;
    }

    const narrow = getNarrowFromNotificationData(config.startup.notification);
    return AppNavigator.router.getStateForAction(navigateToChat(narrow), state);
  },
);
