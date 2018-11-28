/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState, Narrow, NavigationState, Selector } from '../types';
import config from '../config';
import { navigateToChat } from './navActions';
import { getUsersById } from '../users/userSelectors';
import AppNavigator from './AppNavigator';
import { getNarrowFromNotificationData } from '../utils/notifications';

export const getNav = (state: GlobalState): NavigationState => state.nav;

const getNavigationRoutes = (state: GlobalState): Object[] => state.nav.routes;

const getNavigationIndex = (state: GlobalState): number => state.nav.index;

export const getCurrentRouteName = (state: GlobalState): string =>
  state.nav.routes[state.nav.index].routeName;

export const getCurrentRouteParams: Selector<Object> = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes && routes[index] && routes[index].params,
);

export const getChatScreenParams: Selector<{ narrow: Narrow }> = createSelector(
  getCurrentRouteParams,
  params => params || { narrow: undefined },
);

export const getCanGoBack = (state: GlobalState): boolean => state.nav.index > 0;

export const getSameRoutesCount: Selector<number> = createSelector(getNav, nav => {
  let i = nav.routes.length - 1;
  while (i >= 0) {
    if (nav.routes[i].routeName !== nav.routes[nav.routes.length - 1].routeName) {
      break;
    }
    i--;
  }
  return nav.routes.length - i - 1;
});

export const getStateForRoute = (route: string, params?: Object): ?NavigationState => {
  const action = AppNavigator.router.getActionForPathAndParams(route, params);
  return action != null ? AppNavigator.router.getStateForAction(action) : null;
};

export const getInitialNavState: Selector<?NavigationState> = createSelector(
  getNav,
  getUsersById,
  (nav, usersById) => {
    const state =
      !nav || (nav.routes.length === 1 && nav.routes[0].routeName === 'loading')
        ? getStateForRoute('main')
        : nav;

    if (!config.startup.notification) {
      return state;
    }

    const narrow = getNarrowFromNotificationData(config.startup.notification, usersById);
    return AppNavigator.router.getStateForAction(navigateToChat(narrow), state);
  },
);
