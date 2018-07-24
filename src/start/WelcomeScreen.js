/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Context, Dispatch } from '../types';
import { ViewPlaceholder, ZulipButton, Label, Logo } from '../common';
import { navigateToAddNewAccount, navigateToWelcomeHelp } from '../actions';

const componentStyles = StyleSheet.create({
  title: {
    fontSize: 30,
    textAlign: 'center',
    paddingVertical: 16,
  },
  sectionWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});

type Props = {
  dispatch: Dispatch,
};

class WelcomeScreen extends PureComponent<Props> {
  props: Props;
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { dispatch } = this.props;
    const { styles } = this.context;

    return (
      <View style={[styles.screen, styles.padding]}>
        <View style={componentStyles.sectionWrapper}>
          <Logo />
          <Label text="Welcome to Zulip!" style={componentStyles.title} />
        </View>
        <View style={componentStyles.sectionWrapper}>
          <ZulipButton
            text="I have a Zulip account"
            onPress={() => {
              dispatch(navigateToAddNewAccount(''));
            }}
          />
          <ViewPlaceholder height={20} />
          <ZulipButton
            text="I am new to Zulip"
            onPress={() => {
              dispatch(navigateToWelcomeHelp());
            }}
          />
        </View>
      </View>
    );
  }
}

export default connect()(WelcomeScreen);
