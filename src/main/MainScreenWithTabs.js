/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import styles, { ThemeContext } from '../styles';
import { OfflineNotice, ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

export default class MainScreenWithTabs extends PureComponent<{||}> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    return (
      <View style={[styles.flexed, { backgroundColor: this.context.backgroundColor }]}>
        <ZulipStatusBar />
        <OfflineNotice />
        <MainTabs />
      </View>
    );
  }
}
