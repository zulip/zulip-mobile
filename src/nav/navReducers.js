import { NavigationExperimental } from 'react-native';

import {
  INIT_ROUTES,
  PUSH_ROUTE,
  POP_ROUTE,
  OPEN_STREAM_SIDEBAR,
  CLOSE_STREAM_SIDEBAR,
} from '../nav/navActions';

import { LOGIN_SUCCESS, LOGOUT } from '../account/accountActions';

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
    case PUSH_ROUTE:
      if (state.routes[state.index].key === (action.route && action.route.key)) return state;
      return NavigationStateUtils.push(state, action.route);
    case POP_ROUTE:
      if (state.index === 0 || state.routes.length === 1) return state;
      return NavigationStateUtils.pop(state);
    case LOGIN_SUCCESS:
      return NavigationStateUtils.push(state, { key: 'main' });
    case LOGOUT:
      return NavigationStateUtils.reset(state, [{ key: 'realm' }, { key: 'password' }]);
    default:
      return state;
  }
};
