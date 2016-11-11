import { fromJS } from 'immutable';

import {
  REALM_ADD,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../constants';

const initialState = fromJS([]);

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_ADD: {
      const accountIndex = state.findIndex(account =>
        account.get('realm') === action.realm
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
    case SET_AUTH_TYPE:
      return state.setIn([0, 'authType'], action.authType);
    case LOGIN_SUCCESS: {
      const accountIndex = state.findIndex(account =>
        account.get('realm') === action.realm &&
        (!account.get('email') || account.get('email') === action.email)
      );

      const { type, ...newAccount } = action; // eslint-disable-line no-unused-vars

      if (accountIndex === -1) {
        return state.unshift(newAccount);
      }

      if (accountIndex === 0) {
        return state.mergeIn([0], newAccount);
      }

      const mergedAccount = state.get(accountIndex).merge(fromJS(newAccount));
      return state
        .unshift(mergedAccount)
        .delete(accountIndex + 1);
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
