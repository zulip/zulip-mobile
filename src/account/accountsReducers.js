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
  Identity,
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

const findAccount = (state: AccountsState, identity: Identity): number => {
  const { realm, email } = identity;
  return state.findIndex(
    account => account.realm === realm && (!account.email || account.email === email),
  );
};

const loginSuccess = (state: AccountsState, action: LoginSuccessAction): AccountsState => {
  const { realm, email, apiKey } = action;
  const accountIndex = findAccount(state, { realm, email });
  if (accountIndex === -1) {
    return [{ realm, email, apiKey }, ...state];
  }
  return [
    { ...state[accountIndex], email, apiKey },
    ...state.slice(0, accountIndex),
    ...state.slice(accountIndex + 1),
  ];
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
