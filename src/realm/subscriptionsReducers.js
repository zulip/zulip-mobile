import { fromJS } from 'immutable';

import {
  REALM_SET_STREAMS,
} from './realmActions';

// Initial state
const initialState = fromJS({});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REALM_SET_STREAMS:
      return fromJS(action.subscriptions.map((v) => [v.name, v]));
    default:
      return state;
  }
};

export default reducer;
