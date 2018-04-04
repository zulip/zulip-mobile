/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type { ChildrenArray, Dimensions, LocalizableText } from '../types';
import connectWithActions from '../connectWithActions';
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
  padding: {
    padding: 10,
  },
});

type Props = {
  padding?: boolean,
  search?: boolean,
  centerContent: boolean,
  safeAreaInsets: Dimensions,
  scrollView: boolean,
  title?: LocalizableText,
  children: ChildrenArray<*>,
  searchBarOnChange?: (text: string) => void,
};

class Screen extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    scrollView: true,
    centerContent: false,
  };

  render() {
    const {
      padding,
      search,
      centerContent,
      title,
      children,
      safeAreaInsets,
      searchBarOnChange,
    } = this.props;
    const { styles } = this.context;
    const ModalBar = search ? ModalSearchNavBar : ModalNavBar;

    return (
      <View style={[styles.screen, { marginBottom: safeAreaInsets.bottom }]}>
        <ZulipStatusBar />
        <ModalBar title={title} searchBarOnChange={searchBarOnChange} />
        <KeyboardAvoider
          behavior="padding"
          keyboardShouldPersistTaps="always"
          style={[componentStyles.wrapper, padding && componentStyles.padding]}
          contentContainerStyle={[padding && componentStyles.padding]}
        >
          <ScrollView
            contentContainerStyle={[
              componentStyles.childrenWrapper,
              centerContent && componentStyles.content,
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
  safeAreaInsets: getSession(state).safeAreaInsets,
}))(Screen);
