/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen, ViewPlaceholder, ZulipButton } from '../common';
import { navigateToRealmScreen, navigateToWelcomeHelp } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
|}>;

class WelcomeScreen extends PureComponent<Props> {
  render() {
    const { dispatch } = this.props;
    return (
      <Screen title="Welcome!" centerContent padding canGoBack={false}>
        <ZulipButton
          text="I have a Zulip account"
          onPress={() => {
            dispatch(navigateToRealmScreen(''));
          }}
        />
        <ViewPlaceholder height={20} />
        <ZulipButton
          text="I am new to Zulip"
          onPress={() => {
            dispatch(navigateToWelcomeHelp());
          }}
        />
      </Screen>
    );
  }
}

export default connect()(WelcomeScreen);
