/* @flow */
import React, { PureComponent } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';

import type { LocalizableText } from '../types';
import { ZulipStatusBar } from '../common';
import ModalNavBar from '../nav/ModalNavBar';
import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const componentStyles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
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
    title?: LocalizableText,
    children: [],
    searchBarOnChange?: (text: string) => void,
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { search, title, children, searchBarOnChange } = this.props;
    const { styles } = this.context;
    const ModalBar = search ? ModalSearchNavBar : ModalNavBar;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar />
        <ModalBar title={title} searchBarOnChange={searchBarOnChange} />
        <KeyboardAvoidingView style={componentStyles.keyboardAvoid} behavior="padding">
          <ScrollView contentContainerStyle={componentStyles.screenWrapper}>{children}</ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
