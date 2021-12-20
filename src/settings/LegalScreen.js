/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import { Screen, NestedNavRow, ZulipText } from '../common';
import { openLinkEmbedded } from '../utils/openLink';
import { getRealmUrl, getRealmName } from '../selectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'legal'>,
  route: RouteProp<'legal', void>,
|}>;

/** (NB this is a per-account screen: it leads to this realm's policies.) */
export default function LegalScreen(props: Props): Node {
  const realm = useSelector(getRealmUrl);
  const realmName = useSelector(getRealmName);

  const openZulipPolicies = useCallback(() => {
    openLinkEmbedded('https://zulip.com/policies/?nav=no');
  }, []);

  const openRealmPolicies = useCallback(() => {
    openLinkEmbedded(new URL('/policies/?nav=no', realm).toString());
  }, [realm]);

  return (
    <Screen title="Legal">
      <NestedNavRow label="Zulip terms" onPress={openZulipPolicies} />
      <NestedNavRow
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
        label={{
          text: 'Terms for {realmName}',
          values: { realmName: <ZulipText style={{ fontWeight: 'bold' }} text={realmName} /> },
        }}
        onPress={openRealmPolicies}
      />
    </Screen>
  );
}
