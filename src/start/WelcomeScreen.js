/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import connectWithActions from '../connectWithActions';
import type { Actions } from '../types';
import { Screen, Centerer, ZulipButton } from '../common';

const componentStyles = StyleSheet.create({
  divider: {
    height: 20,
  },
});

type Props = {
  actions: Actions,
};

class WelcomeScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { actions } = this.props;
    return (
      <Screen title="Welcome!" centerContent padding>
        <Centerer>
          <ZulipButton
            secondary
            text="I have a Zulip account"
            onPress={() => actions.navigateToAddNewAccount('')}
          />
          <View style={componentStyles.divider} />
          <ZulipButton
            secondary
            text="I am new to Zulip"
            onPress={() => actions.navigateToWelcomeHelp()}
          />
        </Centerer>
      </Screen>
    );
  }
}

export default connectWithActions(props => ({}))(WelcomeScreen);
