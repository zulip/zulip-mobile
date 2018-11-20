/* @flow */
import type {
  NavigationState,
  NavAction,
  RehydrateAction,
  AccountSwitchAction,
  LoginSuccessAction,
  LogoutAction,
  InitialFetchCompleteAction,
} from '../types';
import { getStateForRoute, getInitialNavState } from './navSelectors';
import AppNavigator from './AppNavigator';
import { NULL_NAV_STATE } from '../nullObjects';
import {
  REHYDRATE,
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';
import { getActiveAccount } from '../account/accountsSelectors';

const initialState = getStateForRoute('loading') || NULL_NAV_STATE;

const rehydrate = (state: NavigationState, action: RehydrateAction): NavigationState => {
  if (!action.payload || !action.payload.accounts) {
    return getStateForRoute('welcome') || state;
  }
  const rehydratedState = action.payload;
  if (!getActiveAccount(rehydratedState).apiKey) {
    const { accounts } = rehydratedState;
    // getStateForRoute can return null, but it is unclear under what
    // conditions. Empirically, it doesn't return null on the initial start of
    // the app, but this should be verified.
    // $FlowFixMe: getStateForRoute may return null but it shouldn't.
    return getStateForRoute(accounts && accounts.length > 1 ? 'account' : 'welcome');
  }
  return getInitialNavState(rehydratedState) || state;
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

export default (state: NavigationState = initialState, action: NavAction): NavigationState => {
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

    default:
      return AppNavigator.router.getStateForAction(action, state) || state;
  }
};
