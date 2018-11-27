/* @flow strict-local */
import {
  REALM_ADD,
  LOGIN_SUCCESS,
  ACCOUNT_SWITCH,
  LOGOUT,
  ACCOUNT_REMOVE,
} from '../actionConstants';

import type {
  AccountsState,
  AccountAction,
  RealmAddAction,
  AccountSwitchAction,
  AccountRemoveAction,
  LoginSuccessAction,
  LogoutAction,
} from '../types';
import { NULL_ARRAY } from '../nullObjects';

const initialState = NULL_ARRAY;

const realmAdd = (state: AccountsState, action: RealmAddAction): AccountsState => {
  const accountIndex = state.findIndex(account => account.realm === action.realm);

  if (accountIndex !== -1) {
    return [state[accountIndex], ...state.slice(0, accountIndex), ...state.slice(accountIndex + 1)];
  }

  return [
    {
      realm: action.realm,
      apiKey: '',
      email: '',
    },
    ...state,
  ];
};

const accountSwitch = (state: AccountsState, action: AccountSwitchAction): AccountsState => {
  if (action.index === 0) {
    return state;
  }

  return [state[action.index], ...state.slice(0, action.index), ...state.slice(action.index + 1)];
};

const loginSuccess = (state: AccountsState, action: LoginSuccessAction): AccountsState => {
  const accountIndex = state.findIndex(
    account => account.realm === action.realm && (!account.email || account.email === action.email),
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
};

const logout = (state: AccountsState, action: LogoutAction): AccountsState => [
  { ...state[0], apiKey: '' },
  ...state.slice(1),
];

const accountRemove = (state: AccountsState, action: AccountRemoveAction): AccountsState => {
  const newState = state.slice();
  newState.splice(action.index, 1);
  return newState;
};

export default (state: AccountsState = initialState, action: AccountAction): AccountsState => {
  switch (action.type) {
    case REALM_ADD:
      return realmAdd(state, action);

    case ACCOUNT_SWITCH:
      return accountSwitch(state, action);

    case LOGIN_SUCCESS:
      return loginSuccess(state, action);

    case LOGOUT:
      return logout(state, action);

    case ACCOUNT_REMOVE:
      return accountRemove(state, action);

    default:
      return state;
  }
};
