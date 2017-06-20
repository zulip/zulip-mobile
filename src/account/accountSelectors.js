/* @flow */
import { AccountState } from '../types';

export const getActiveAccount = (state: AccountState) =>
  (state.accounts ? state.accounts[0] : undefined);

export const getSelfEmail = (state: AccountState) =>
  state.accounts[0].email;

export const getAuth = (state: AccountState) => {
  const account = getActiveAccount(state);

  if (!account) {
    return {
      apiKey: undefined,
      email: undefined,
      realm: undefined,
    };
  }

  // Returning a copy here (instead of the original object)
  // causes all components in the app to re-render
  return account;
};
