/* @flow strict-local */

import React, { PureComponent } from 'react';

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

class LegalScreen extends PureComponent<Props> {
  openTermsOfService = () => {
    const { realm } = this.props;
    openLinkEmbedded(new URL('/terms/?nav=no', realm).toString());
  };

  openPrivacyPolicy = () => {
    const { realm } = this.props;
    openLinkEmbedded(new URL('/privacy/?nav=no', realm).toString());
  };

  render() {
    return (
      <Screen title="Legal">
        <OptionButton label="Terms of service" onPress={this.openTermsOfService} />
        <OptionButton label="Privacy policy" onPress={this.openPrivacyPolicy} />
      </Screen>
    );
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(LegalScreen);
