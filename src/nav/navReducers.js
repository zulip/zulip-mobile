import { NavigationExperimental } from 'react-native';

import {
  PUSH_ROUTE,
  POP_ROUTE,
  OPEN_STREAM_SIDEBAR,
  CLOSE_STREAM_SIDEBAR,
} from '../nav/navActions';

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
    case PUSH_ROUTE:
      if (state.routes[state.index].key === (action.route && action.route.key)) return state;
      return NavigationStateUtils.push(state, action.route);
    case POP_ROUTE:
      if (state.index === 0 || state.routes.length === 1) return state;
      return NavigationStateUtils.pop(state);
    default:
      return state;
  }
};
