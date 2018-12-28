/* @flow strict-local */

import type { Account, GlobalState, Identity } from '../types';
import { NULL_ACCOUNT } from '../nullObjects';
import { getAccounts } from '../directSelectors';

export const getActiveAccount = (state: GlobalState): Account => {
  const accounts = getAccounts(state);
  return accounts && accounts.length > 0 ? accounts[0] : NULL_ACCOUNT;
};

export const getOwnEmail = (state: GlobalState) => getActiveAccount(state).email;

export const getCurrentRealm = (state: GlobalState) => getActiveAccount(state).realm;

export const getAuth = getActiveAccount;

export const getIdentity = (state: GlobalState): Identity => {
  const { email, realm } = getAuth(state);
  return {
    email,
    realm,
  };
};
