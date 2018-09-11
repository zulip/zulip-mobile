/* @flow */
import { createSelector } from 'reselect';
import isEqual from 'lodash.isequal';

import type { GlobalState } from '../types';
import config from '../config';
import { getNav, getNavigationIndex, getNavigationRoutes } from '../directSelectors';
import { navigateToChat } from './navActions';
import { getUsersById } from '../users/userSelectors';
import AppNavigator from './AppNavigator';
import { getNarrowFromNotificationData } from '../utils/notifications';

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

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
      nav.routes[i].routeName !== nav.routes[nav.routes.length - 1].routeName
      || !isEqual(nav.routes[i].params, nav.routes[nav.routes.length - 1].params)
    ) {
      break;
    }
    i--;
  }
  return nav.routes.length - i - 1;
});

export const getPreviousDifferentRoute = createSelector(getNav, nav => {
  if (nav.routes.length < 2) {
    return '';
  }

  let i = nav.routes.length - 2;
  while (i >= 0 && nav.routes[i].routeName === nav.routes[nav.routes.length - 1].routeName) {
    i--;
  }

  return nav.routes[i < 0 ? 0 : i].key;
});

export const getPreviousDifferentRouteAndParams = createSelector(getNav, nav => {
  if (nav.routes.length < 2) {
    return '';
  }

  let i = nav.routes.length - 2;
  while (
    i >= 0
    && nav.routes[i].routeName === nav.routes[nav.routes.length - 1].routeName
    && isEqual(nav.routes[i].params, nav.routes[nav.routes.length - 1].params)
  ) {
    i--;
  }

  return nav.routes[i < 0 ? 0 : i].key;
});

export const getStateForRoute = (route: string, params?: Object) => {
  const action = AppNavigator.router.getActionForPathAndParams(route, params);
  return action != null ? AppNavigator.router.getStateForAction(action) : null;
};

export const getInitialNavState = createSelector(getNav, getUsersById, (nav, usersById) => {
  const state =
    !nav || (nav.routes.length === 1 && nav.routes[0].routeName === 'loading')
      ? getStateForRoute('main')
      : nav;

  if (!config.startup.notification) {
    return state;
  }

  const narrow = getNarrowFromNotificationData(config.startup.notification, usersById);
  return AppNavigator.router.getStateForAction(navigateToChat(narrow), state);
});

export const getCurrentRouteName = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes && routes[index] && routes[index].routeName,
);

export const getCurrentRouteParams = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes && routes[index] && routes[index].params,
);

export const getCurrentRouteNarrow = createSelector(
  getCurrentRouteParams,
  params => params || { narrow: undefined },
);

export const getTopMostNarrow = createSelector(getNav, nav => {
  const { routes } = nav;
  let { index } = nav;
  while (index >= 0) {
    if (routes[index].routeName === 'chat') {
      return routes[index].params.narrow;
    }
    index--;
  }
  return undefined;
});
