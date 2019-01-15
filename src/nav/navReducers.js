/* @flow strict-local */
import type { NavigationAction } from 'react-navigation';

import type {
  NavigationState,
  Action,
  RehydrateAction,
  AccountSwitchAction,
  LoginSuccessAction,
  LogoutAction,
  InitialFetchCompleteAction,
} from '../types';
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

const initialState = getStateForRoute('loading') || NULL_NAV_STATE;

const rehydrate = (state: NavigationState, action: RehydrateAction): NavigationState => {
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

const accountSwitch = (state: NavigationState, action: AccountSwitchAction): NavigationState =>
  getStateForRoute('loading') || state;

const loginSuccess = (state: NavigationState, action: LoginSuccessAction): NavigationState =>
  getStateForRoute('main') || state;

const logout = (state: NavigationState, action: LogoutAction): NavigationState =>
  getStateForRoute('account') || state;

const initialFetchComplete = (
  state: NavigationState,
  action: InitialFetchCompleteAction,
): NavigationState =>
  state.routes[0].routeName === 'main' ? state : getStateForRoute('main') || state;

export default (state: NavigationState = initialState, action: Action): NavigationState => {
  switch (action.type) {
    case REHYDRATE:
      return rehydrate(state, action);

    case ACCOUNT_SWITCH:
      return accountSwitch(state, action);

    case LOGIN_SUCCESS:
      return loginSuccess(state, action);

    case INITIAL_FETCH_COMPLETE:
      return initialFetchComplete(state, action);

    case LOGOUT:
      return logout(state, action);

    default: {
      // The `react-navigation` libdef says this only takes a NavigationAction,
      // but docs say pass arbitrary action. $FlowFixMe
      const action1: NavigationAction = action;
      return AppNavigator.router.getStateForAction(action1, state) || state;
    }
  }
};
