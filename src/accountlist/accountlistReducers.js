import { fromJS } from 'immutable';

import {
  REALM_ADD,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../account/accountActions';

const initialState = fromJS([]);

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_ADD: {
      const accountIndex = state.findIndex(x =>
        x.get('realm') === action.realm
      );

      if (accountIndex !== -1) {
        return state
          .unshift(state.get(accountIndex))
          .delete(accountIndex + 1);
      }

      return state.unshift(fromJS({
        realm: action.realm,
      }));
    }
    case LOGIN_SUCCESS: {
      const accountIndex = state.findIndex(x =>
        x.get('realm') === action.realm && x.get('email') === action.email
      );

      const newAccount = fromJS({
        realm: action.realm,
        apiKey: action.apiKey,
        email: action.email,
      });

      if (accountIndex !== -1) {
        return state
          .unshift(newAccount)
          .delete(accountIndex + 1);
      }

      return state.unshift(newAccount);
    }
    case LOGOUT:
      return state
        .setIn([0, 'apiKey'], '');
    case ACCOUNT_REMOVE:
      return state
        .delete(action.index);
    default:
      return state;
  }
};
