/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen, OptionButton } from '../common';
import openLink from '../utils/openLink';
import { getCurrentRealm } from '../selectors';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  realm: string,
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
  realm: getCurrentRealm(state).toString(),
}))(LegalScreen);
