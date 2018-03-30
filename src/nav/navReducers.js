/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import type { NavigationState, Action } from '../types';
import { navigateToChat } from './navActions';
import { getStateForRoute, getInitialNavState } from './navSelectors';
import AppNavigator from './AppNavigator';
import {
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
      return getInitialNavState(action.payload);

    case ACCOUNT_SWITCH:
      return getStateForRoute('loading');

    case LOGIN_SUCCESS:
      return getStateForRoute('main');

    case INITIAL_FETCH_COMPLETE:
      return state.routes[0].routeName === 'main' ?
        state : getStateForRoute('main');

    case LOGOUT:
      return getStateForRoute('account');

    case SWITCH_NARROW:
      return AppNavigator.router.getStateForAction(navigateToChat(action.narrow), state);

    default:
      return AppNavigator.router.getStateForAction(action, state);
  }
};
