import { fromJS } from 'immutable';

import {
  ACCOUNT_ADD_SUCCEEDED,
  LOGIN_SUCCEEDED,
  LOGOUT,
} from './userActions';

const initialState = fromJS({
  email: '',
  apiKey: '',
  realm: '',
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_ADD_SUCCEEDED: {
      return state.merge({
        realm: action.realm,
      });
    }
    case LOGIN_SUCCEEDED:
      return state.merge({
        apiKey: action.apiKey,
        email: action.email,
      });
    case LOGOUT:
      return state.merge({
        apiKey: '',
        email: '',
        realm: '',
      });
    default:
      return state;
  }
};

export const getActiveAuth = (state) =>
  state.find(x => x.get('active')) || initialState;

export default reducer;
