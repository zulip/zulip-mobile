/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { InjectedDispatch } from '../types';
import { connect } from '../react-redux';
import { Screen, OptionButton } from '../common';
import openLink from '../utils/openLink';
import { getFullUrl } from '../utils/url';
import { getCurrentRealm } from '../selectors';

type SelectorProps = {|
  realm: string,
|};

type Props = {|
  ...InjectedDispatch,
  ...SelectorProps,
|};

class LegalScreen extends PureComponent<Props> {
  openTermsOfService = () => {
    const { realm } = this.props;
    openLink(getFullUrl('/terms/', realm));
  };

  openPrivacyPolicy = () => {
    const { realm } = this.props;
    openLink(getFullUrl('/privacy/', realm));
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

export default connect((state): SelectorProps => ({
  realm: getCurrentRealm(state),
}))(LegalScreen);
