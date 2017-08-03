/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import type { LocalizableText } from '../types';
import boundActions from '../boundActions';
import { ZulipStatusBar } from '../common';
import ModalNavBar from '../nav/ModalNavBar';

const componentStyles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

class Screen extends PureComponent {
  props: {
    keyboardAvoiding: boolean,
    title: LocalizableText,
    children: [],
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { keyboardAvoiding, title, children } = this.props;
    const WrapperView = keyboardAvoiding && Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const { styles } = this.context;
    const flattenStyle = StyleSheet.flatten(styles.background);
    const backgroundColor = flattenStyle ? flattenStyle.backgroundColor : undefined;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar backgroundColor={backgroundColor} />
        <ModalNavBar title={title} />
        <WrapperView style={componentStyles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}

export default connect(
  state => ({
    orientation: state.app.orientation,
  }),
  boundActions,
)(Screen);
