/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';
import { OfflineNotice, ZulipStatusBar } from '../common';
import MainTabs from './MainTabs';

export default class MainScreenWithTabs extends PureComponent<{}> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={[styles.flexed, styles.backgroundColor]}>
        {/* $FlowFixMe-56 Cannot create ZulipStatusBar element because ST is not a React component. */}
        <ZulipStatusBar />
        <OfflineNotice />
        <MainTabs />
      </View>
    );
  }
}
