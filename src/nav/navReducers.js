/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import type { NavigationState, Action } from '../types';
import { getFirstIfDeepEqual } from '../utils/immutability';
import { navigateToChat } from './navActions';
import { getStateForRoute, getInitialRoute } from './navSelectors';
import AppNavigator from './AppNavigator';
import {
  RESET_NAVIGATION,
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  LOGIN_SUCCESS,
  LOGOUT,
  SWITCH_NARROW,
} from '../actionConstants';

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

    case INITIAL_FETCH_COMPLETE:
      return getFirstIfDeepEqual(
        state,
        getStateForRoute('main'),
        (a, b) => state.routes[0].routeName === 'main',
      );

    case LOGOUT:
      return getStateForRoute('account');

    case SWITCH_NARROW:
      return AppNavigator.router.getStateForAction(navigateToChat(), state);

    default:
      return AppNavigator.router.getStateForAction(action, state);
  }
};
