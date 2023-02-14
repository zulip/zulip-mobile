/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useSelector } from '../react-redux';
import Screen from '../common/Screen';
import NavRow from '../common/NavRow';
import ZulipText from '../common/ZulipText';
import { openLinkWithUserPreference } from '../utils/openLink';
import { getRealmUrl, getRealmName, getGlobalSettings } from '../selectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'legal'>,
  route: RouteProp<'legal', void>,
|}>;

/** (NB this is a per-account screen: it leads to this realm's policies.) */
export default function LegalScreen(props: Props): Node {
  const realm = useSelector(getRealmUrl);
  const realmName = useSelector(getRealmName);

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const openZulipPolicies = useCallback(() => {
    openLinkWithUserPreference(new URL('https://zulip.com/policies/?nav=no'), globalSettings);
  }, [globalSettings]);

  const openRealmPolicies = useCallback(() => {
    openLinkWithUserPreference(new URL('/policies/?nav=no', realm), globalSettings);
  }, [realm, globalSettings]);

  return (
    <Screen title="Legal">
      <NavRow title="Zulip terms" onPress={openZulipPolicies} type="external" />
      <NavRow
        // These are really terms set by the server admin responsible for
        // hosting the org, and that server admin may or may not represent
        // the org itself, as this text might be read to imply. (E.g.,
        // on Zulip Cloud they don't.) But:
        // - We don't want to complicate the wording. Not everyone knows
        //   what a server is.
        // - These terms will often differ from Zulip's own terms (the ones
        //   at the other link).
        // - These terms will apply to all users in the org, in all cases.
        //   We should link to them.
        title={{
          text: 'Terms for {realmName}',
          values: { realmName: <ZulipText style={{ fontWeight: 'bold' }} text={realmName} /> },
        }}
        onPress={openRealmPolicies}
        type="external"
      />
    </Screen>
  );
}
