import { NavigationExperimental } from 'react-native';

import {
  INIT_ROUTES,
  PUSH_ROUTE,
  POP_ROUTE,
  OPEN_STREAM_SIDEBAR,
  CLOSE_STREAM_SIDEBAR,
} from '../nav/navActions';

import { SET_AUTH_TYPE, LOGIN_SUCCESS } from '../account/accountActions';

import {
  STREAM_SET_MESSAGES,
} from '../stream/streamActions';

const {
  StateUtils: NavigationStateUtils,
} = NavigationExperimental;

const initialState = {
  index: 0,
  key: 'root',
  routes: [{
    key: 'loading',
    title: 'Loading',
  }],
  opened: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_STREAM_SIDEBAR:
      return {
        ...state,
        opened: true,
      };
    case CLOSE_STREAM_SIDEBAR:
      return {
        ...state,
        opened: false,
      };
    case STREAM_SET_MESSAGES:
      return {
        ...state,
        opened: false,
      };
    case INIT_ROUTES:
      return NavigationStateUtils.reset(
        state,
        action.routes.map(route => ({ key: route }))
      );
    case PUSH_ROUTE: {
      const newRouteKey = (action.route && action.route.key);
      if (state.routes[state.index].key !== newRouteKey) {
        return NavigationStateUtils.push(state, action.route);
      }
      return state;
    }
    case POP_ROUTE:
      if (state.index === 0 || state.routes.length === 1) return state;
      return NavigationStateUtils.pop(state);
    case SET_AUTH_TYPE:
      return NavigationStateUtils.push(state, { key: action.authType });
    case LOGIN_SUCCESS:
      return NavigationStateUtils.push(state, { key: 'main' });
    default:
      return state;
  }
};
