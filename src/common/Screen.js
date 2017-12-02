/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ChildrenArray, Dimensions, LocalizableText } from '../types';
import connectWithActions from '../connectWithActions';
import { KeyboardAvoider, ZulipStatusBar } from '../common';
import ModalNavBar from '../nav/ModalNavBar';
import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
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
  scrollView: boolean,
  title?: LocalizableText,
  children: ChildrenArray<*>,
  searchBarOnChange?: (text: string) => void,
  rightItem?: Object,
};

class Screen extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    scrollView: true,
  };

  render() {
    const {
      padding,
      search,
      title,
      children,
      safeAreaInsets,
      searchBarOnChange,
      rightItem,
    } = this.props;
    const { styles } = this.context;
    const ModalBar = search ? ModalSearchNavBar : ModalNavBar;

    return (
      <View style={[styles.screen, { marginBottom: safeAreaInsets.bottom }]}>
        <ZulipStatusBar />
        <ModalBar title={title} searchBarOnChange={searchBarOnChange} rightItem={rightItem} />
        <KeyboardAvoider
          behavior="padding"
          keyboardShouldPersistTaps="always"
          style={[componentStyles.wrapper, padding && componentStyles.padding]}
          contentContainerStyle={[padding && componentStyles.padding]}
        >
          {children}
        </KeyboardAvoider>
      </View>
    );
  }
}

export default connectWithActions((state, props) => ({
  safeAreaInsets: state.app.safeAreaInsets,
}))(Screen);
