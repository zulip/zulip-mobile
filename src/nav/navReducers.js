/* @flow strict-local */
import type { NavigationAction } from 'react-navigation';

import type { NavigationState, Action } from '../types';
import config from '../config';
import { navigateToChat } from './navActions';
import { getUsersById } from '../users/userSelectors';
import { getNarrowFromNotificationData } from '../notification';
import AppNavigator from './AppNavigator';
import { NULL_NAV_STATE } from '../nullObjects';
import {
  REHYDRATE,
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';
import { hasAuth } from '../account/accountsSelectors';

export const getStateForRoute = (route: string) => {
  const action = AppNavigator.router.getActionForPathAndParams(route);
  return action != null ? AppNavigator.router.getStateForAction(action) : null;
};

const rehydrate = (state, action) => {
  if (!action.payload || !action.payload.accounts) {
    return getStateForRoute('welcome') || state;
  }

  const rehydratedState = action.payload;
  if (!hasAuth(rehydratedState)) {
    const { accounts } = rehydratedState;
    const result = getStateForRoute(accounts && accounts.length > 1 ? 'account' : 'welcome');
    // getStateForRoute can return null, but it is unclear under what
    // conditions. Empirically, it doesn't return null on the initial start of
    // the app, but this should be verified.
    // $FlowFixMe: getStateForRoute may return null but it shouldn't.
    return (result: NavigationState);
  }

  const startState = getStateForRoute('main');
  if (!config.startup.notification) {
    return startState || state;
  }

  const usersById = getUsersById(rehydratedState);
  const narrow = getNarrowFromNotificationData(config.startup.notification, usersById);
  return AppNavigator.router.getStateForAction(navigateToChat(narrow), startState) || state;
};

const initialState = getStateForRoute('loading') || NULL_NAV_STATE;

export default (state: NavigationState = initialState, action: Action): NavigationState => {
  switch (action.type) {
    case REHYDRATE:
      return rehydrate(state, action);

    case ACCOUNT_SWITCH:
      return getStateForRoute('loading') || state;

    case LOGIN_SUCCESS:
      return getStateForRoute('main') || state;

    case INITIAL_FETCH_COMPLETE:
      return state.routes[0].routeName === 'main' ? state : getStateForRoute('main') || state;

    case LOGOUT:
      return getStateForRoute('account') || state;

    default: {
      // The `react-navigation` libdef says this only takes a NavigationAction,
      // but docs say pass arbitrary action. $FlowFixMe
      const action1: NavigationAction = action;
      return AppNavigator.router.getStateForAction(action1, state) || state;
    }
  }
};
