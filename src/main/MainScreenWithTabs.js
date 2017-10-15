/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

export default class MainScreenWithTabs extends PureComponent<{}> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        <ZulipStatusBar />
        <MainTabs />
      </View>
    );
  }
}
