/* @flow */
import { StateType } from '../types';

export const getActiveAccount = (state: StateType) =>
  (state.accounts ? state.accounts[0] : undefined);

export const getSelfEmail = (state: StateType) =>
  state.accounts[0].email;

export const getAuth = (state: StateType) => {
  const account = getActiveAccount(state);

  if (!account) {
    return {
      apiKey: null,
      email: null,
      realm: null,
      password: null
    };
  }

  // Returning a copy here (instead of the original object)
  // causes all components in the app to re-render
  return account;
};
