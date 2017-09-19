/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { LocalizableText } from '../types';
import { KeyboardAvoider, ZulipStatusBar } from '../common';
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
  padding: {
    padding: 10,
  },
});

export default class Screen extends PureComponent {
  props: {
    padding?: boolean,
    search?: boolean,
    title?: LocalizableText,
    children: [],
    searchBarOnChange?: (text: string) => void,
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { padding, search, title, children, searchBarOnChange } = this.props;
    const { styles } = this.context;
    const ModalBar = search ? ModalSearchNavBar : ModalNavBar;

    return (
      <View style={styles.screen}>
        <ZulipStatusBar />
        <ModalBar title={title} searchBarOnChange={searchBarOnChange} />
        <KeyboardAvoider style={componentStyles.keyboardAvoid} behavior="padding">
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={[
              componentStyles.screenWrapper,
              padding && componentStyles.padding,
            ]}
          >
            {children}
          </ScrollView>
        </KeyboardAvoider>
      </View>
    );
  }
}
