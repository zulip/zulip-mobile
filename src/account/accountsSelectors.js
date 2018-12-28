/* @flow strict-local */

import type { Account, Auth, GlobalState, Identity } from '../types';
import { NULL_ACCOUNT } from '../nullObjects';
import { getAccounts } from '../directSelectors';

/**
 * Get the account currently foregrounded in the UI, or undefined if none.
 *
 * For use in early startup, onboarding, account-switch, or other times
 * where there may be no active account.
 *
 * See `getActiveAccount` for use in the UI for an already-active account
 * (including the bulk of the app), and code intended for that UI.
 */
export const tryGetActiveAccount = (state: GlobalState): Account | void => {
  const accounts = getAccounts(state);
  return accounts && accounts.length > 0 ? accounts[0] : undefined;
};

/**
 * Get the account currently foregrounded in the UI, asserting there is one.
 *
 * For use in all the normal-use screens of the app, which assume there is
 * an active account.
 *
 * See `tryGetActiveAccount` for use where there might not be an active account.
 */
export const getActiveAccount = (state: GlobalState): Account => {
  const account = tryGetActiveAccount(state);
  if (account === undefined) {
    throw new Error('No account found');
  }
  return account;
};

/** The user's own email in the active account; throws if none. */
export const getOwnEmail = (state: GlobalState): string => {
  const activeAccount = getActiveAccount(state);
  return activeAccount.email;
};

export const getCurrentRealm = (state: GlobalState) => {
  const activeAccount = tryGetActiveAccount(state);
  return activeAccount ? activeAccount.realm : '';
};

export const getAuth = (state: GlobalState): Auth => tryGetActiveAccount(state) || NULL_ACCOUNT;

export const getIdentity = (state: GlobalState): Identity => {
  const { email, realm } = getAuth(state);
  return {
    email,
    realm,
  };
};
