/* @flow strict-local */
import { createSelector } from 'reselect';

import type { Account, Auth, GlobalState, Identity, Selector } from '../types';
import { getAccounts } from '../directSelectors';
import { identityOfAccount, keyOfIdentity } from './accountMisc';

/** See `getAccountStatuses`. */
export type AccountStatus = {| ...Identity, isLoggedIn: boolean |};

/**
 * The list of known accounts, with a boolean for logged-in vs. not.
 *
 * This should be used in preference to `getAccounts` where we don't
 * actually need the API keys, but just need to know whether we have them.
 */
export const getAccountStatuses = (state: GlobalState): AccountStatus[] => {
  const accounts = getAccounts(state);
  return accounts.map(({ realm, email, apiKey }) => ({ realm, email, isLoggedIn: apiKey !== '' }));
};

/**
 * All known accounts, indexed by identity.
 */
export const getAccountsByIdentity: Selector<(Identity) => Account | void> = createSelector(
  getAccounts,
  accounts => {
    const map = new Map(
      accounts.map(account => [keyOfIdentity(identityOfAccount(account)), account]),
    );
    return identity => map.get(keyOfIdentity(identity));
  },
);

/**
 * The account currently foregrounded in the UI, or undefined if none.
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
 * The account currently foregrounded in the UI; throws if none.
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

export const authOfAccount = (account: Account): Auth => {
  const { realm, email, apiKey } = account;
  return { realm, email, apiKey };
};

/**
 * The auth object for the active account, even if not logged in; throws if none.
 *
 * For use in authentication flows, or other places that operate on an
 * active account which may not be logged in.
 *
 * See:
 *  * `tryGetAuth` for the meaning of "active" and "logged in".
 *  * `tryGetAuth` again, for use where there might not be an active account.
 *  * `getAuth` for use in the bulk of the app.
 */
export const getPartialAuth = (state: GlobalState): Auth => authOfAccount(getActiveAccount(state));

/**
 * The auth object for the active, logged-in account, or undefined if none.
 *
 * The "active" account is the one currently foregrounded in the UI, if any.
 * The active account is "logged-in" if we have an API key for it.
 *
 * This is for use in early startup, onboarding, account-switch,
 * authentication flows, or other times where there may be no active account
 * or it may not be logged in.
 *
 * See:
 *  * `getAuth` for use in the bulk of the app, operating on a logged-in
 *    active account.
 *  * `getPartialAuth` for use in authentication flows, where there is an
 *    active account but it may not be logged in.
 */
export const tryGetAuth = (state: GlobalState): Auth | void => {
  const account = tryGetActiveAccount(state);
  if (!account || account.apiKey === '') {
    return undefined;
  }
  return authOfAccount(account);
};

/**
 * True just if there is an active, logged-in account.
 *
 * See `tryGetAuth` for the meaning of "active, logged-in".
 */
export const hasAuth = (state: GlobalState): boolean => !!tryGetAuth(state);

/**
 * The auth object for the active, logged-in account; throws if none.
 *
 * For use in all the normal-use screens and codepaths of the app, which
 * assume there is an active, logged-in account.
 *
 * See:
 *  * `tryGetAuth` for the meaning of "active, logged-in".
 *  * `tryGetAuth` again, for use where there might not be such an account.
 */
export const getAuth = (state: GlobalState): Auth => {
  const auth = tryGetAuth(state);
  if (auth === undefined) {
    throw new Error('Active account not logged in');
  }
  return auth;
};

/**
 * The identity for the active, logged-in account; throws if none.
 *
 * See `getAuth` and `tryGetAuth` for discussion.
 */
export const getIdentity: Selector<Identity> = createSelector(getAuth, auth => {
  const { email, realm } = auth;
  return { email, realm };
});
