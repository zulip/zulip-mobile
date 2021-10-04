/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import { Screen, NestedNavRow } from '../common';
import { openLinkEmbedded } from '../utils/openLink';
import { getRealmUrl } from '../selectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'legal'>,
  route: RouteProp<'legal', void>,
|}>;

export default function LegalScreen(props: Props): Node {
  const realm = useSelector(getRealmUrl);

  const openTermsOfService = useCallback(() => {
    openLinkEmbedded(new URL('/terms/?nav=no', realm).toString());
  }, [realm]);

  const openPrivacyPolicy = useCallback(() => {
    openLinkEmbedded(new URL('/privacy/?nav=no', realm).toString());
  }, [realm]);

  return (
    <Screen title="Legal">
      <NestedNavRow label="Terms of service" onPress={openTermsOfService} />
      <NestedNavRow label="Privacy policy" onPress={openPrivacyPolicy} />
    </Screen>
  );
}
