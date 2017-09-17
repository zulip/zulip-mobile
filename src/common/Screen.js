/* @flow */
import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

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
    title?: LocalizableText,
    children: [],
    searchBarOnChange?: (text: string) => void,
  };

  static defaultProps = {
    scrollable: true,
  };

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { search, title, children, searchBarOnChange } = this.props;
    const { styles } = this.context;

    return (
      <ScrollView contentContainerStyle={styles.screen}>
        <ZulipStatusBar />
        {search ? (
          <ModalSearchNavBar title={title} searchBarOnChange={searchBarOnChange} />
        ) : (
          <ModalNavBar title={title} />
        )}

        <ScrollView contentContainerStyle={componentStyles.screenWrapper} behavior="padding">
          {children}
        </ScrollView>
      </ScrollView>
    );
  }
}
