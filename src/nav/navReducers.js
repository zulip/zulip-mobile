/* @flow */
import { NavigationExperimental } from 'react-native';

import { NavigationState, Action } from '../types';
import {
  INIT_ROUTES,
  ACCOUNT_SWITCH,
  PUSH_ROUTE,
  POP_ROUTE,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
} from '../actionConstants';

const {
  StateUtils: NavigationStateUtils,
} = NavigationExperimental;

const initialState: NavigationState = {
  index: 0,
  key: 'root',
  routes: [{
    key: 'loading',
    title: 'Loading',
  }],
};

export default (state: NavigationState = initialState, action: Action): NavigationState => {
  switch (action.type) {
    case INIT_ROUTES:
      return NavigationStateUtils.reset(
        state,
        action.routes.map(route => ({ key: route }))
      );
    case ACCOUNT_SWITCH:
      return NavigationStateUtils.reset(
        state,
        [{ key: 'main' }]
      );
    case PUSH_ROUTE: {
      if (state.routes[state.index].key === action.route) return state;
      return NavigationStateUtils.push(state, { key: action.route, data: action.data });
    }
    case POP_ROUTE:
      if (state.index === 0 || state.routes.length === 1) return state;
      return NavigationStateUtils.pop(state);
    case SET_AUTH_TYPE:
      return NavigationStateUtils.push(state, { key: action.authType });
    case LOGIN_SUCCESS:
      return NavigationStateUtils.reset(state, [{ key: 'main' }]);
    default:
      return state;
  }
};
