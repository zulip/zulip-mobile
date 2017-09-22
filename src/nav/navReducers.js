/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import type { NavigationState, Action } from '../types';
import { navigateToAccountPicker } from './navActions';
import { getStateForRoute, getInitialRoute } from './navSelectors';
import AppNavigator from './AppNavigator';
import { RESET_NAVIGATION, ACCOUNT_SWITCH, LOGIN_SUCCESS, LOGOUT } from '../actionConstants';

export default (
  state: NavigationState = getStateForRoute('loading'),
  action: Action,
): NavigationState => {
  switch (action.type) {
    case REHYDRATE:
      return getStateForRoute(getInitialRoute(action.payload));

    case RESET_NAVIGATION:
      return getStateForRoute(getInitialRoute(state));

    case ACCOUNT_SWITCH:
      return getStateForRoute('loading');

    case LOGIN_SUCCESS:
      return getStateForRoute('main');

    case LOGOUT:
      return AppNavigator.router.getStateForAction(navigateToAccountPicker(), state);

    default:
      return AppNavigator.router.getStateForAction(action, state);
  }
};
