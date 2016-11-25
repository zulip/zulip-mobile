import {
  REALM_ADD,
  SET_AUTH_TYPE,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../constants';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case REALM_ADD: {
      const accountIndex = state.findIndex(account =>
        account.realm === action.realm
      );

      if (accountIndex !== -1) {
        return state
          .unshift(state[accountIndex])
          .delete(accountIndex + 1);
      }

      return state.unshift({
        realm: action.realm,
      });
    }
    case SET_AUTH_TYPE: {
      const newState = state.slice();
      newState[0].authType = action.authType;
      return newState;
    }
    case LOGIN_SUCCESS: {
      const accountIndex = state.findIndex(account =>
        account.realm === action.realm &&
        (!account.email || account.email === action.email)
      );

      const { type, ...newAccount } = action; // eslint-disable-line no-unused-vars

      if (accountIndex === -1) {
        return [
          newAccount,
          ...state,
        ];
      }

      if (accountIndex === 0) {
        const newState = state.slice();
        newState[0] = newAccount;
        return newState;
      }

      const mergedAccount = {
        ...state[accountIndex],
        ...newAccount,
      };
      return [
        mergedAccount,
        ...state.slice(0, accountIndex),
        ...state.slice(accountIndex + 1),
      ];
    }
    case LOGOUT: {
      const newState = state.slice();
      newState[0].apiKey = '';
      return newState;
    }
    case ACCOUNT_REMOVE: {
      const newState = state.slice();
      newState.splice(action.index, 1);
      return newState;
    }
    default:
      return state;
  }
};
