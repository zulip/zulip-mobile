/* @flow */
import React from 'react';
import { connect } from 'react-redux';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import { PopRouteAction, NavigationState } from '../types';
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
    title: string,
    nav: NavigationState,
    children: [],
    popRoute: PopRouteAction,
  }

  render() {
    const { keyboardAvoiding, title, nav, children, navigateBack } = this.props;
    const WrapperView = keyboardAvoiding && Platform.OS === 'ios' ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar />
        <ModalNavBar title={title} navigateBack={navigateBack} nav={nav} />
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
