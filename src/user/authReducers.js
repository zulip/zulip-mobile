import { fromJS } from 'immutable';

import {
  ACCOUNT_ADD_SUCCEEDED,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,
} from './userActions';

const initialState = fromJS({
  isLoggedIn: false,
  email: '',
  apiKey: '',
  realm: '',
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACCOUNT_ADD_SUCCEEDED: {
      return state.merge({
        isLoggedIn: false,
        realm: action.realm,
      });
    }
    case LOGIN_SUCCEEDED:
      return state.merge({
        isLoggedIn: true,
        email: action.email,
        apiKey: action.apiKey,
      });
    case LOGIN_FAILED:
      return state.merge({
        loggedIn: false,
      });
    default:
      return state;
  }
};

export default reducer;
