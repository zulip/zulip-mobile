/* @flow */
import type { InputSelector } from 'reselect';
import { createSelector } from 'reselect';

import type { Account, GlobalState } from '../types';
import { NULL_ACCOUNT } from '../nullObjects';
import { getAccounts } from '../directSelectors';

export const getActiveAccount: InputSelector<GlobalState, void, Account> = createSelector(
  getAccounts,
  accounts => (accounts && accounts.length > 0 ? accounts[0] : NULL_ACCOUNT),
);

export const getOwnEmail = createSelector(getActiveAccount, activeAccount => activeAccount.email);

export const getCurrentRealm = createSelector(
  getActiveAccount,
  activeAccount => activeAccount.realm,
);

export const getAuth = getActiveAccount;
