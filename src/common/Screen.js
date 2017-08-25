/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

import type { LocalizableText } from '../types';
import { ZulipStatusBar } from '../common';
import ModalNavBar from '../nav/ModalNavBar';
import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const componentStyles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
});

export default class Screen extends PureComponent {
  props: {
    search?: boolean,
    keyboardAvoiding?: boolean,
    title?: LocalizableText,
    children: [],
    searchBarOnChange?: (text: string) => void,
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { search, keyboardAvoiding, title, children, searchBarOnChange } = this.props;
    const WrapperView = keyboardAvoiding && Platform.OS === 'ios' ? KeyboardAvoidingView : View;
    const { styles } = this.context;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar />
        {search
          ? <ModalSearchNavBar title={title} searchBarOnChange={searchBarOnChange} />
          : <ModalNavBar title={title} />}

        <WrapperView style={componentStyles.screenWrapper} behavior="padding">
          {children}
        </WrapperView>
      </View>
    );
  }
}
