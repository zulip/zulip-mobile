/* @flow strict-local */
import { createSelector } from 'reselect';
import invariant from 'invariant';

import type {
  Account,
  Auth,
  PerAccountState,
  GlobalState,
  Identity,
  Selector,
  GlobalSelector,
} from '../types';
import { assumeSecretlyGlobalState } from '../reduxTypes';
import { getAccounts } from '../directSelectors';
import { identityOfAccount, keyOfIdentity, identityOfAuth, authOfAccount } from './accountMisc';
import { ZulipVersion } from '../utils/zulipVersion';

/** See `getAccountStatuses`. */
export type AccountStatus = {| ...Identity, isLoggedIn: boolean |};

/**
 * The list of known accounts, with a boolean for logged-in vs. not.
 *
 * This should be used in preference to `getAccounts` where we don't
 * actually need the API keys, but just need to know whether we have them.
 */
export const getAccountStatuses: GlobalSelector<
  $ReadOnlyArray<AccountStatus>,
> = createSelector(getAccounts, accounts =>
  accounts.map(({ realm, email, apiKey }) => ({ realm, email, isLoggedIn: apiKey !== '' })),
);

/** The list of known accounts, reduced to `Identity`. */
export const getIdentities: GlobalSelector<$ReadOnlyArray<Identity>> = createSelector(
  getAccounts,
  accounts => accounts.map(identityOfAccount),
);

/**
 * All known accounts, indexed by identity.
 */
export const getAccountsByIdentity: GlobalSelector<(Identity) => Account | void> = createSelector(
  getAccounts,
  accounts => {
    const map = new Map(
      accounts.map(account => [keyOfIdentity(identityOfAccount(account)), account]),
    );
    return identity => map.get(keyOfIdentity(identity));
  },
);

/**
 * The per-account state for the active account; undefined if no such account.
 *
 * I.e., for the account currently foregrounded in the UI.  See glossary:
 *   https://github.com/zulip/zulip-mobile/blob/main/docs/glossary.md
 *
 * In our legacy model where the global state is all about the active
 * account (pre-#5006), this is a lot like the identity function.  Use this
 * function where even in a multi-account post-#5006 model, the input will
 * be the global state.
 *
 * In particular, always use this function (rather than simply casting) in
 * early startup, onboarding, account-switch, or other times where there may
 * be no active account.
 */
export const tryGetActiveAccountState = (state: GlobalState): PerAccountState | void => {
  const accounts = getAccounts(state);
  return accounts && accounts.length > 0 ? state : undefined;
};

/**
 * The `Account` object for this account.
 *
 * "This account" meaning the one this per-account state corresponds to.
 */
export const getAccount = (state: PerAccountState): Account => {
  // TODO(#5006): This is the key place we assume a PerAccountState is
  //   secretly a GlobalState.  We'll put the active `Account` somewhere
  //   better and then fix that.
  //   We're also assuming that the intended account is the active one.
  const globalState = assumeSecretlyGlobalState(state);
  const accounts = globalState.accounts;
  invariant(accounts.length > 0, 'getAccount: must have account');
  return accounts[0];
};

/** The realm URL for this account. */
export const getRealmUrl = (state: PerAccountState): URL => getAccount(state).realm;

/**
 * The auth object for this account, if logged in; else undefined.
 *
 * The account is "logged in" if we have an API key for it.
 *
 * This is for use in early startup, onboarding, account-switch,
 * authentication flows, or other times where the given account may not be
 * logged in.
 *
 * See:
 *  * `getAuth` for use in the bulk of the app, operating on a logged-in
 *    account.
 */
// TODO(#5006): Should be called just tryGetAuth, after the old one is gone.
export const tryGetThisAuth: Selector<Auth | void> = createSelector(getAccount, account => {
  if (account.apiKey === '') {
    return undefined;
  }
  return authOfAccount(account);
});

/**
 * DEPRECATED on road to #5006.
 *
 * Calls to this can be translated to calls to `tryGetActiveAccountState`
 * followed by `tryGetThisAuth`.  They should become that, if the caller is
 * indeed global, or just `tryGetThisAuth` if the caller is per-account.
 */
export const tryGetAuth = (globalState: GlobalState): Auth | void => {
  const state = tryGetActiveAccountState(globalState);
  if (!state) {
    return undefined;
  }
  return tryGetThisAuth(state);
};

/**
 * True just if there is an active, logged-in account.
 *
 * See `tryGetAuth` for the meaning of "active, logged-in".
 */
export const getHasAuth = (globalState: GlobalState): boolean => {
  const state = tryGetActiveAccountState(globalState);
  return !!state && !!tryGetThisAuth(state);
};

/**
 * The auth object for this account, if logged in; else throws.
 *
 * For use in all the normal-use screens and codepaths of the app, which
 * assume the specified account is logged in.
 *
 * See:
 *  * `tryGetAuth` for the meaning of "logged in".
 *  * `tryGetAuth` again, for use where the account might not be logged in.
 */
export const getAuth = (state: PerAccountState): Auth => {
  const auth = tryGetThisAuth(state);
  if (auth === undefined) {
    throw new Error('Active account not logged in');
  }
  return auth;
};

/**
 * The identity for this account, if logged in; throws if not logged in.
 *
 * See `getAuth` and `tryGetAuth` for discussion.
 */
// TODO why should this care if the account is logged in?
export const getIdentity: Selector<Identity> = createSelector(getAuth, auth =>
  identityOfAuth(auth),
);

/**
 * The Zulip server version for this account, or null if unknown.
 *
 * See the `zulipVersion` property of `Account` for details on how this
 * information is kept up to date.
 */
export const getServerVersion = (state: PerAccountState): ZulipVersion | null =>
  getAccount(state).zulipVersion;
