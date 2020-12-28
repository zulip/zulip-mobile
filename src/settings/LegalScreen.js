/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { NavigationStackProp, NavigationStateRoute } from 'react-navigation-stack';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen, OptionButton } from '../common';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';

type Props = $ReadOnly<{|
  // Since we've put this screen in a stack-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the stack-nav shape.
  navigation: NavigationStackProp<NavigationStateRoute>,

  dispatch: Dispatch,
  realm: URL,
|}>;

class LegalScreen extends PureComponent<Props> {
  openTermsOfService = () => {
    const { realm } = this.props;
    openLink(new URL('/terms/?nav=no', realm).toString());
  };

  openPrivacyPolicy = () => {
    const { realm } = this.props;
    openLink(new URL('/privacy/?nav=no', realm).toString());
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
