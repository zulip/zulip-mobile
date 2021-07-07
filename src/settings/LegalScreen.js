/* @flow strict-local */

import React, { useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen, OptionButton } from '../common';
import { openLinkEmbedded } from '../utils/openLink';
import { getCurrentRealm } from '../selectors';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'legal'>,
  route: RouteProp<'legal', void>,

  dispatch: Dispatch,
  realm: URL,
|}>;

function LegalScreen(props: Props) {
  const { realm } = props;

  const openTermsOfService = useCallback(() => {
    openLinkEmbedded(new URL('/terms/?nav=no', realm).toString());
  }, [realm]);

  const openPrivacyPolicy = useCallback(() => {
    openLinkEmbedded(new URL('/privacy/?nav=no', realm).toString());
  }, [realm]);

  return (
    <Screen title="Legal">
      <OptionButton label="Terms of service" onPress={openTermsOfService} />
      <OptionButton label="Privacy policy" onPress={openPrivacyPolicy} />
    </Screen>
  );
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(LegalScreen);
