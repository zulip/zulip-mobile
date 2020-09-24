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

export const getTopMostNarrow: Selector<void | Narrow> = createSelector(
  getNav,
  nav => {
    const { routes } = nav;
    let { index } = nav;
    while (index >= 0) {
      if (routes[index].routeName === 'chat') {
        const { params } = routes[index];
        return params ? params.narrow : undefined;
      }
      index--;
    }
    return undefined;
  },
);

export const getCanGoBack = (state: GlobalState) => state.nav.index > 0;

export const getSameRoutesCount: Selector<number> = createSelector(
  getNav,
  nav => {
    let i = 0;
    while (i < nav.routes.length) {
      if (nav.routes[i].routeName === nav.routes[nav.routes.length - 1].routeName) {
        return nav.routes.length - i;
      }
      i++;
    }
    return 0;
  },
);
