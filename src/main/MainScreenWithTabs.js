/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';
import { OfflineNotice, ZulipStatusBar } from '../common';
import MainDrawer from './MainDrawer';

export default class MainScreenWithTabs extends PureComponent<{}> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <ZulipStatusBar />
        <OfflineNotice />
        <MainDrawer />
      </View>
    );
  }
}
