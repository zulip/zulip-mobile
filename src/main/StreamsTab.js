/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';
import StreamsTabsNavigator from './StreamsTabsNavigator';

export default class StreamsTab extends PureComponent<{}> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return (
      <View style={styles.tabContainer}>
        <StreamsTabsNavigator />
      </View>
    );
  }
}
