/* @flow strict-local */
import type { NavigationAction } from 'react-navigation';

import type { NavigationState, Action } from '../types';
import { getNavigationRoutes } from './navSelectors';
import AppNavigator from './AppNavigator';
import { INITIAL_FETCH_COMPLETE } from '../actionConstants';

/**
 * Get the initial state for the given route.
 *
 * Private; exported only for tests.
 */
export const getStateForRoute = (route: string): NavigationState => {
  const action = AppNavigator.router.getActionForPathAndParams(route);
  if (!action) {
    // The argument should be a constant string that is a genuine nav route;
    // so this condition can only happen if we've gotten that wrong.
    throw new Error(`bad route: ${route}`);
  }
  const state = AppNavigator.router.getStateForAction(action);
  if (!state) {
    throw new Error(`bad route at getStateForAction: ${route}`);
  }
  return state;
};

export const initialState = getStateForRoute('loading');

export default (state: NavigationState = initialState, action: Action): NavigationState => {
  switch (action.type) {
    case INITIAL_FETCH_COMPLETE:
      // If we're anywhere in the normal UI of the app, then remain
      // where we are. Only reset the nav state if we're elsewhere,
      // and in that case, go to the main screen.
      //
      // TODO: "elsewhere" is probably just a way of saying "on the
      // loading screen", but we're not sure. We could adjust the
      // conditional accordingly, if we found out we're not depending on
      // the more general condition; see
      //   https://github.com/zulip/zulip-mobile/pull/4274#discussion_r505941875
      return getNavigationRoutes()[0].routeName === 'main' ? state : getStateForRoute('main');

    default: {
      // The `react-navigation` libdef says this only takes a NavigationAction,
      // but docs say pass arbitrary action. $FlowFixMe
      const action1: NavigationAction = action;
      return AppNavigator.router.getStateForAction(action1, state) || state;
    }
  }
};
