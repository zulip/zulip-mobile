import { fromJS } from 'immutable';

import {
  REALM_INIT,
} from '../constants';

const initialState = fromJS({});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REALM_INIT:
      return fromJS(action.data.subscriptions);
    default:
      return state;
  }
};

export default reducer;
