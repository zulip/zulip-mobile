/* @flow */
import { REHYDRATE } from 'redux-persist/constants';

import type { NavigationState, Action } from '../types';
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

export default (state: NavigationState = initialState, action: Action): NavigationState => {
  switch (action.type) {
    case REHYDRATE:
      return getInitialNavState(action.payload) || state;

    case ACCOUNT_SWITCH:
      return getStateForRoute('loading') || state;

    case LOGIN_SUCCESS:
      return getStateForRoute('main') || state;

    case INITIAL_FETCH_COMPLETE:
      return state.routes[0].routeName === 'main' ? state : getStateForRoute('main') || state;

    case LOGOUT:
      return getStateForRoute('account') || state;

    case SWITCH_NARROW:
      return AppNavigator.router.getStateForAction(navigateToChat(action.narrow), state) || state;

    default:
      return AppNavigator.router.getStateForAction(action, state) || state;
  }
};
