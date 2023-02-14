/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import { createSelector } from 'reselect';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector } from '../react-redux';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import ZulipText from '../common/ZulipText';
import { openLinkWithUserPreference } from '../utils/openLink';
import { getRealmName, getGlobalSettings } from '../selectors';
import { getAccounts } from '../directSelectors';
import type { GlobalSelector } from '../reduxTypes';
import { getAccount, tryGetActiveAccountState } from '../account/accountsSelectors';
import { identityOfAccount, keyOfIdentity } from '../account/accountMisc';
import { getHaveServerData } from '../haveServerDataSelectors';

/**
 * Data for all realms represented in `state.accounts`, logged-in or not,
 *   unique by URL.
 *
 * The realm name will be missing when we don't have server data for any
 * account on the realm.
 */
type ViewModel = $ReadOnlyArray<{|
  +realm: URL,
  +name: string | null,
  +policiesUrl: URL,
|}>;

const getViewModel: GlobalSelector<ViewModel> = createSelector(
  getAccounts,
  tryGetActiveAccountState,
  (accounts, activeAccountState) => {
    const result = new Map(accounts.map(a => [a.realm.toString(), null]));

    accounts.forEach(account => {
      const realmStr = account.realm.toString();

      if (result.get(realmStr) != null) {
        return;
      }

      // TODO(#5006): Add realm name for any account we have server data for,
      //   not just the active account.
      if (
        activeAccountState
        && keyOfIdentity(identityOfAccount(getAccount(activeAccountState)))
          === keyOfIdentity(identityOfAccount(account))
        && getHaveServerData(activeAccountState)
      ) {
        result.set(realmStr, getRealmName(activeAccountState));
      }
    });

    return [...result.entries()].map(([realmStr, name]) => {
      const realm = new URL(realmStr);
      return {
        realm,
        name,
        policiesUrl: new URL('/policies/?nav=no', realm),
      };
    });
  },
);

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'legal'>,
  route: RouteProp<'legal', void>,
|}>;

/**
 * A global, all-accounts screen linking to terms for all realms we know about.
 */
export default function LegalScreen(props: Props): Node {
  const viewModel = useGlobalSelector(getViewModel);

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const openZulipPolicies = useCallback(() => {
    openLinkWithUserPreference(new URL('https://zulip.com/policies/?nav=no'), globalSettings);
  }, [globalSettings]);

  return (
    <Screen title="Legal">
      <NavRow title="Zulip terms" onPress={openZulipPolicies} type="external" />
      {viewModel.map(({ realm, name, policiesUrl }) => (
        <NavRow
          key={realm.toString()}
          // These are really terms set by the server admin responsible for
          // hosting the org, and that server admin may or may not represent
          // the org itself, as this text might be read to imply. (E.g.,
          // on Zulip Cloud they don't.) But:
          // - We don't want to complicate the wording. Not everyone knows
          //   what a server is.
          // - These terms will often differ from Zulip's own terms (the ones
          //   at the "Zulip terms" link).
          // - These terms will apply to all users in the org, in all cases.
          //   We should link to them.
          title={{
            text: 'Terms for {realmName}',
            values: {
              realmName: (
                // The realm name comes from server data. If we don't
                // have server data, fall back on the realm URL.
                <ZulipText style={{ fontWeight: 'bold' }} text={name ?? realm.toString()} />
              ),
            },
          }}
          subtitle={
            // It's nice to be explicit about where the policies live,
            // though the "?nav=no" is a bit annoying. But also, this line
            // disambiguates multiple realms with the same name; the name is
            // shown (when we have it) in `title`.
            { text: '{_}', values: { _: policiesUrl.toString() } }
          }
          onPress={() => {
            openLinkWithUserPreference(policiesUrl, globalSettings);
          }}
          type="external"
        />
      ))}
    </Screen>
  );
}
