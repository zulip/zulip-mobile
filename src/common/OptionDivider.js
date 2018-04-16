/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

export default class OptionDivider extends PureComponent<{}> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;

    return <View style={styles.divider} />;
  }
}
