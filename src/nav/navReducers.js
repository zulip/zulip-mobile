/* @flow */
import type { NavigationState, Action } from '../types';
import { navigateToAccountPicker, navigateBack } from './navActions';
import AppNavigator from './AppNavigator';
import {
  RESET_NAVIGATION,
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';

const initialState = AppNavigator.router.getStateForAction(
  AppNavigator.router.getActionForPathAndParams('main'),
);

export default (state: NavigationState = initialState, action: Action): NavigationState => {
  switch (action.type) {
    case RESET_NAVIGATION:
      return initialState;
    case ACCOUNT_SWITCH:
      return initialState;
    case SET_AUTH_TYPE:
      return state;
    case LOGIN_SUCCESS:
    case INITIAL_FETCH_COMPLETE:
      return AppNavigator.router.getStateForAction(navigateBack(), state);
    case LOGOUT: {
      return AppNavigator.router.getStateForAction(navigateToAccountPicker(), state);
    }
    default:
      return AppNavigator.router.getStateForAction(action, state);
  }
};
