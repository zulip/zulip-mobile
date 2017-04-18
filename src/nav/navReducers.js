import { NavigationActions } from 'react-navigation';

import AppNavigator from './AppNavigator';
import {
  INIT_ROUTES,
  INITIAL_FETCH_COMPLETE,
  ACCOUNT_SWITCH,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
  LOGOUT,
} from '../actionConstants';

const initialState = {
  index: 0,
  routes: [
    { key: 'main', routeName: 'main' },
  ],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case INIT_ROUTES:
      return state;
    case ACCOUNT_SWITCH:
      return state;
    case SET_AUTH_TYPE:
      return state;
    case LOGIN_SUCCESS:
    case INITIAL_FETCH_COMPLETE:
      return AppNavigator.router.getStateForAction(NavigationActions.back(), state);
    case LOGOUT: {
      return AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Account' }),
        state,
      );
    }
    default:
      return AppNavigator.router.getStateForAction(action, state);
  }
};
