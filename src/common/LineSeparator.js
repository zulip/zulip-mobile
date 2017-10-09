/* @flow */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

export default class LineSeparator extends PureComponent<void> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    return <View style={this.context.styles.lineSeparator} />;
  }
}
