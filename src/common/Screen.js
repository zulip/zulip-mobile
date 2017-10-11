/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { Dimensions, LocalizableText } from '../types';
import connectWithActions from '../connectWithActions';
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

type Props = {
  padding?: boolean,
  search?: boolean,
  safeAreaInsets: Dimensions,
  title?: LocalizableText,
  children: React.ChildrenArray<any>,
  searchBarOnChange?: (text: string) => void,
};

class Screen extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { padding, search, title, children, safeAreaInsets, searchBarOnChange } = this.props;
    const { styles } = this.context;
    const ModalBar = search ? ModalSearchNavBar : ModalNavBar;

    return (
      <View style={[styles.screen, { marginBottom: safeAreaInsets.bottom }]}>
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

export default connectWithActions((state, props) => ({
  safeAreaInsets: state.app.safeAreaInsets,
}))(Screen);
