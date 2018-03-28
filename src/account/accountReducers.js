/* @flow */
import {
  REALM_ADD,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../actionConstants';

import type { AccountState, Action } from '../types';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

export default (state: AccountState = initialState, action: Action): AccountState => {
  switch (action.type) {
    case REALM_ADD: {
      const accountIndex = state.findIndex(account => account.realm === action.realm);

      if (accountIndex !== -1) {
        return [
          state[accountIndex],
          ...state.slice(0, accountIndex),
          ...state.slice(accountIndex + 1),
        ];
      }

      return [
        {
          realm: action.realm,
          apiKey: '',
          email: '',
        },
        ...state,
      ];
    }

    case ACCOUNT_SWITCH: {
      if (action.index === 0) {
        return state;
      }

      return [
        state[action.index],
        ...state.slice(0, action.index),
        ...state.slice(action.index + 1),
      ];
    }

    case LOGIN_SUCCESS: {
      const accountIndex = state.findIndex(
        account =>
          account.realm === action.realm && (!account.email || account.email === action.email),
      );

      const { type, ...newAccount } = action; // eslint-disable-line no-unused-vars

      if (accountIndex === -1) {
        return [newAccount, ...state];
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
      return [mergedAccount, ...state.slice(0, accountIndex), ...state.slice(accountIndex + 1)];
    }

    case LOGOUT: {
      // Empty out the active account's api key
      const { auth } = action;
      let isStateChanged = false;
      const newState = state.reduce((accounts, account) => {
        if (
          account.apiKey !== '' &&
          account.email === auth.email &&
          account.apiKey === auth.apiKey
        ) {
          isStateChanged = true;
          accounts.push({ ...account, apiKey: '' });
        } else {
          accounts.push(account);
        }
        return accounts;
      }, []);

      if (isStateChanged) {
        return newState;
      }
      return state;
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
