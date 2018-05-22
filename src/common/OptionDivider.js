/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { Context } from '../types';

export default class OptionDivider extends PureComponent<{}> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return <View style={styles.divider} />;
  }
}
