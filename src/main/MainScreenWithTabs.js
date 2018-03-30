/* @flow */
// @ts-check
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

export default class MainScreenWithTabs extends PureComponent<{}> {
  static contextTypes = {
    styles: () => null,
  };
  static router = MainTabs.router; //Try to comment out this line and check navigation state Tab navigator routes are registered with this

  render() {
    const { styles } = this.context;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <MainTabs />
      </View>
    );
  }
}
