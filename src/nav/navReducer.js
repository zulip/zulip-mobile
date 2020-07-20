/* @flow strict-local */
import type { NavigationAction } from 'react-navigation';

import type { NavigationState, Action } from '../types';
import AppNavigator from './AppNavigator';
import {
  REHYDRATE,
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';
import { hasAuth } from '../account/accountsSelectors';

/**
 * Get the initial state for the given route.
 *
 * Private; exported only for tests.
 */
export const getStateForRoute = (route: string): NavigationState => {
  // TODO: this is kind of a hack!  Refactor to a better way.
  //  * Perhaps pass `initial: true` unconditionally in this initialization
  //    code, to all routes?  Then that'd just be part of the interface of
  //    making a screen work as an initial screen.
  //  * Alternatively, we could replace the whole system of `ModalNavBar`,
  //    `canGoBack`, etc., with our own "navigation view" that would be more
  //    directly integrated into the navigation framework:
  //      https://reactnavigation.org/docs/en/2.x/navigation-views.html
  const params = route === 'realm' ? { initial: true } : undefined;

  const action = AppNavigator.router.getActionForPathAndParams(route, params);
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

const rehydrate = (state, action) => {
  // If there's no data to rehydrate, or no account data, show login screen.
  if (!action.payload || !action.payload.accounts) {
    return getStateForRoute('realm');
  }

  // If there are accounts but the active account is not logged in,
  // show account screen.
  const rehydratedState = action.payload;
  if (!hasAuth(rehydratedState)) {
    const { accounts } = rehydratedState;
    return getStateForRoute(accounts && accounts.length > 1 ? 'account' : 'realm');
  }

  // If there's an active, logged-in account but no server data, then behave
  // like `ACCOUNT_SWITCH`: show loading screen.  Crucially, `sessionReducer`
  // will have set `needsInitialFetch`, too, so we really will be loading.
  //
  // (Valid server data must have a user: the self user, at a minimum.)
  if (rehydratedState.users === undefined) {
    return getStateForRoute('loading');
  }

  // Great: we have an active, logged-in account, and server data for it.
  // Show the main UI.
  return getStateForRoute('main');
};

export const initialState = getStateForRoute('loading');

export default (state: NavigationState = initialState, action: Action): NavigationState => {
  switch (action.type) {
    case REHYDRATE:
      return rehydrate(state, action);

    case ACCOUNT_SWITCH:
    case LOGIN_SUCCESS:
      return getStateForRoute('loading');

    case INITIAL_FETCH_COMPLETE:
      return state.routes[0].routeName === 'main' ? state : getStateForRoute('main');

    case LOGOUT:
      return getStateForRoute('account');

    default: {
      // The `react-navigation` libdef says this only takes a NavigationAction,
      // but docs say pass arbitrary action. $FlowFixMe
      const action1: NavigationAction = action;
      return AppNavigator.router.getStateForAction(action1, state) || state;
    }
  }
};
