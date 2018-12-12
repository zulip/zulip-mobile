/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch } from '../types';
import { Screen, ViewPlaceholder, ZulipButton } from '../common';
import { navigateToRealmScreen, navigateToWelcomeHelp } from '../actions';

type Props = {
  dispatch: Dispatch,
};

class WelcomeScreen extends PureComponent<Props> {
  render() {
    const { dispatch } = this.props;
    return (
      <Screen title="Welcome!" centerContent padding>
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
