/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import type { Actions, LocalizableText, NavigationState } from '../types';
import boundActions from '../boundActions';
import { ZulipStatusBar } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

const componentStyles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

class Screen extends React.Component {

  props: {
    actions: Actions,
    keyboardAvoiding: boolean,
    title: LocalizableText,
    nav: NavigationState,
    children: [],
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { actions, keyboardAvoiding, title, nav, children } = this.props;
    const WrapperView = keyboardAvoiding && Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const { styles } = this.context;
    const backgroundColor = StyleSheet.flatten(styles.background).backgroundColor;

    return (
      <View style={componentStyles.screen}>
        <ZulipStatusBar
          backgroundColor={backgroundColor}
        />
        <ModalNavBar title={title} popRoute={actions.popRoute} nav={nav} />
        <WrapperView style={componentStyles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect(
  (state) => ({
    orientation: state.app.orientation,
  }),
  boundActions,
)(Screen);
