/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type { ChildrenArray, Dimensions, LocalizableText, StyleObj } from '../types';
import { connectWithActionsPreserveOnBack } from '../connectWithActions';
import { KeyboardAvoider, ZulipStatusBar } from '../common';
import { getSession } from '../selectors';
import ModalNavBar from '../nav/ModalNavBar';
import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  childrenWrapper: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

type Props = {
  autoFocus: boolean,
  centerContent: boolean,
  children: ChildrenArray<*>,
  safeAreaInsets: Dimensions,
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled',
  padding?: boolean,
  search?: boolean,
  title?: LocalizableText,
  style?: StyleObj,
  searchBarOnChange?: (text: string) => void,
};

class Screen extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    autoFocus: false,
    centerContent: false,
    keyboardShouldPersistTaps: 'handled',
  };

  render() {
    const {
      autoFocus,
      centerContent,
      children,
      keyboardShouldPersistTaps,
      padding,
      safeAreaInsets,
      search,
      searchBarOnChange,
      style,
      title,
    } = this.props;
    const { styles } = this.context;

    return (
      <View style={[styles.screen, { marginBottom: safeAreaInsets.bottom }]}>
        <ZulipStatusBar />
        {search ? (
          <ModalSearchNavBar autoFocus={autoFocus} searchBarOnChange={searchBarOnChange} />
        ) : (
          <ModalNavBar title={title} />
        )}
        <KeyboardAvoider
          behavior="padding"
          style={[componentStyles.wrapper, padding && styles.padding]}
          contentContainerStyle={[padding && styles.padding]}
        >
          <ScrollView
            style={componentStyles.childrenWrapper}
            contentContainerStyle={[centerContent && componentStyles.content, style]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          >
            {children}
          </ScrollView>
        </KeyboardAvoider>
      </View>
    );
  }
}

export default connectWithActionsPreserveOnBack((state, props) => ({
  safeAreaInsets: getSession(state).safeAreaInsets,
}))(Screen);
