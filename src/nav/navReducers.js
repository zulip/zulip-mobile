/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import type {
  NavigationState,
  NavAction,
  RehydrateAction,
  AccountSwitchAction,
  LoginSuccessAction,
  LogoutAction,
  SwitchNarrowAction,
  InitialFetchCompleteAction,
} from '../types';
import { navigateToChat } from './navActions';
import { getStateForRoute, getInitialNavState } from './navSelectors';
import AppNavigator from './AppNavigator';
import { NULL_NAV_STATE } from '../nullObjects';
import {
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
  SWITCH_NARROW,
} from '../actionConstants';

const initialState = getStateForRoute('loading') || NULL_NAV_STATE;

const rehydrate = (state: NavigationState, action: RehydrateAction): NavigationState =>
  getInitialNavState(action.payload) || state;

const accountSwitch = (state: NavigationState, action: AccountSwitchAction): NavigationState =>
  getStateForRoute('loading') || state;

const loginSuccess = (state: NavigationState, action: LoginSuccessAction): NavigationState =>
  getStateForRoute('main') || state;

const logout = (state: NavigationState, action: LogoutAction): NavigationState =>
  getStateForRoute('account') || state;

const switchNarrow = (state: NavigationState, action: SwitchNarrowAction): NavigationState =>
  AppNavigator.router.getStateForAction(navigateToChat(action.narrow), state) || state;

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

    case SWITCH_NARROW:
      return switchNarrow(state, action);

    default:
      return AppNavigator.router.getStateForAction(action, state) || state;
  }
};
