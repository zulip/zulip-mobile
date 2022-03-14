/* @flow strict-local */

import type { Account } from '../types';

export default (args: {|
  hasAuth: boolean,
  accounts: $ReadOnlyArray<Account>,
|}): {| initialRouteName: string, initialRouteParams?: { ... } |} => {
  const { hasAuth, accounts } = args;

  // If the active account is not logged in, bring the user as close
  // as we can to AuthScreen, the place where they can log in.
  if (!hasAuth) {
    if (accounts.length > 0) {
      // Let the user pick the account. If there's just one, it'll be
      // logged out (since `!hasAuth`); therefore it seems right to
      // let the user choose between that account and some new
      // account.
      return { initialRouteName: 'account-pick' };
    } else {
      // Just go to the realm screen and have the user type out the
      // realm.
      return {
        initialRouteName: 'realm-input',
        initialRouteParams: { initial: true },
      };
    }
  }

  // Show the main UI screen.
  //
  // If we don't have server data yet, that screen will show a loading
  // indicator until the data is loaded. Crucially, AppDataFetcher will make
  // sure we really will be loading.
  return { initialRouteName: 'main-tabs' };
};
