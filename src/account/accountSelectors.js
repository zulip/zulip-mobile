/* @flow */
import { createSelector } from 'reselect';

import type { Account, GlobalState } from '../types';
import { NULL_ACCOUNT } from '../nullObjects';

export const getAccounts = (state: GlobalState): Account[] =>
  state.accounts;

export const getActiveAccount = createSelector(
  getAccounts,
  (accounts) => (accounts ? accounts[0] : {}),
);

export const getSelfEmail = createSelector(
  getActiveAccount,
  (activeAccount) => activeAccount.email,
);

export const getAuth = createSelector(
  getActiveAccount,
  (activeAccount) => {
    if (!activeAccount) {
      return NULL_ACCOUNT;
    }

    return activeAccount;
  },
);
