/* @flow */
import { createSelector } from 'reselect';

import type { GlobalState } from '../types';
import config from '../config';
import { getNav } from '../directSelectors';
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
