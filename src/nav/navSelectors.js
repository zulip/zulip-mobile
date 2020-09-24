/* @flow strict-local */
import { createSelector } from 'reselect';

import type { GlobalState, NavigationRouteState, NavigationState, Selector } from '../types';
import type { Narrow } from '../api/apiTypes';

export const getNav = (state: GlobalState): NavigationState => state.nav;

const getNavigationRoutes = (state: GlobalState): NavigationRouteState[] => state.nav.routes;

const getNavigationIndex = (state: GlobalState): number => state.nav.index;

export const getCurrentRouteName = (state: GlobalState): string =>
  state.nav.routes[state.nav.index].routeName;

export const getCurrentRouteParams: Selector<void | { narrow?: Narrow }> = createSelector(
  getNavigationRoutes,
  getNavigationIndex,
  (routes, index) => routes[index] && routes[index].params,
);

export const getChatScreenParams: Selector<{ narrow?: Narrow }> = createSelector(
  getCurrentRouteParams,
  params => params || { narrow: undefined },
);

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

export const getSameRoutesCount: Selector<number> = createSelector(
  getNav,
  nav => {
    let i = nav.routes.length - 1;
    while (i >= 0) {
      if (nav.routes[i].routeName !== nav.routes[nav.routes.length - 1].routeName) {
        break;
      }
      i--;
    }
    return nav.routes.length - i - 1;
  },
);
