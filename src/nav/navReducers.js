/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import type { NavigationState, Action } from '../types';
import { navigateToAccountPicker, navigateToAuth } from './navActions';
import { getStateForRoute, getInitialRoute } from './navSelectors';
import AppNavigator from './AppNavigator';
import {
  RESET_NAVIGATION,
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';

export default (
  state: NavigationState = getStateForRoute('realm'),
  action: Action,
): NavigationState => {
  switch (action.type) {
    case REHYDRATE:
      return getStateForRoute(getInitialRoute(action.payload));
    case RESET_NAVIGATION:
    case ACCOUNT_SWITCH:
      return getStateForRoute(getInitialRoute(state));
    case SET_AUTH_TYPE: {
      return AppNavigator.router.getStateForAction(navigateToAuth(action.authType), state);
    }
    case LOGIN_SUCCESS:
    case INITIAL_FETCH_COMPLETE:
      return getStateForRoute('main');
    case LOGOUT: {
      return AppNavigator.router.getStateForAction(navigateToAccountPicker(), state);
    }
    default:
      return AppNavigator.router.getStateForAction(action, state);
  }
};
