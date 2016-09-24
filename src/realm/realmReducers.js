import Immutable from 'immutable';

import {
  REALM_SET_STREAMS,
} from './realmActions';

// Initial state
const initialState = {
  subscriptions: new Immutable.Map(),
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REALM_SET_STREAMS:
      return {
        ...state,
        subscriptions: new Immutable.Map(
          action.subscriptions.map((v) => [v.name, v])
        ),
      }
    default:
      return state;
  }
};

export default reducer;
