/* @flow */
import { createSelector } from 'reselect';

import type { Account, GlobalState } from '../types';

export const getAccounts = (state: GlobalState): Account[] =>
  state.accounts;

export const getActiveAccount = createSelector(
  getAccounts,
  (accounts) => (accounts ? accounts[0] : undefined),
);

export const getSelfEmail = createSelector(
  getActiveAccount,
  (activeAccount) => activeAccount.email,
);

export const getAuth = createSelector(
  getActiveAccount,
  (activeAccount) => {
    if (!activeAccount) {
      return {
        apiKey: undefined,
        email: undefined,
        realm: undefined,
      };
    }

    return activeAccount;
  },
);
