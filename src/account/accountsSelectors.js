/* @flow strict-local */

import type { Account, Auth, GlobalState, Identity } from '../types';
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

/** The realm of the active account; throws if none. */
export const getCurrentRealm = (state: GlobalState) => {
  const activeAccount = getActiveAccount(state);
  return activeAccount.realm;
};

/**
 * Gets the auth object for the active account, if it actually has an API key.
 *
 * Returns `undefined` if there is no active account, or no API key for it.
 */
export const tryGetValidAuth = (state: GlobalState): Auth | void => {
  const account = tryGetActiveAccount(state);
  if (!account || account.apiKey === '') {
    return undefined;
  }
  return account;
};

/** True just if there is an active account, and we have an API key for it. */
export const hasValidAuth = (state: GlobalState): boolean => !!tryGetValidAuth(state);

/** Asserts there is such a thing; see `getActiveAccount`. */
export const getAuth = (state: GlobalState): Auth => getActiveAccount(state);

/**
 * Gets the identity for the active, logged-in account.
 *
 * Asserts there is such a thing; see `getActiveAccount`.
 */
export const getIdentity = (state: GlobalState): Identity => {
  const account = getActiveAccount(state);
  if (account.apiKey === '') {
    throw new Error('Active account not logged in');
  }
  const { email, realm } = account;
  return { email, realm };
};
