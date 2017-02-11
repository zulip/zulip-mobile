import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';

import { ZulipStatusBar } from '../common';
import ModalNavBar from '../nav/ModalNavBar';


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  padding: {
    padding: 8,
  },
  navigationCard: {
    backgroundColor: 'white',
    shadowColor: 'transparent',
  },
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

export default class Screen extends React.Component {

  props: {
    keyboardAvoiding: boolean,
    title: string,
    padded: boolean,
  }

  render() {
    const { keyboardAvoiding, padded, title, nav, children, popRoute, onLayout } = this.props;
    const WrapperView = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
      <View style={styles.screen} onLayout={onLayout}>
        <ZulipStatusBar />
        <ModalNavBar title={title} popRoute={popRoute} nav={nav} />
        <WrapperView style={[styles.screenWrapper, padded && styles.padding]} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}
