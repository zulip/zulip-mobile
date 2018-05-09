/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import connectWithActions from '../connectWithActions';
import type { Actions } from '../types';
import { Screen, ZulipButton } from '../common';

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
        <ZulipButton
          text="I have a Zulip account"
          onPress={() => actions.navigateToAddNewAccount('')}
        />
        <View style={componentStyles.divider} />
        <ZulipButton text="I am new to Zulip" onPress={() => actions.navigateToWelcomeHelp()} />
      </Screen>
    );
  }
}

export default connectWithActions(props => ({}))(WelcomeScreen);
