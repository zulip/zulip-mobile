/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import type { LocalizableText, PopRouteAction, NavigationState } from '../types';
import { ZulipStatusBar } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

const styles = StyleSheet.create({
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
    keyboardAvoiding: boolean,
    title: LocalizableText,
    nav: NavigationState,
    children: [],
    popRoute: PopRouteAction,
  };

  render() {
    const { keyboardAvoiding, title, nav, children, popRoute } = this.props;
    const WrapperView = keyboardAvoiding && Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar />
        <ModalNavBar title={title} popRoute={popRoute} nav={nav} />
        <WrapperView style={styles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect((state) => ({
  orientation: state.app.orientation,
}))(Screen);
