/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeColors } from '../styles';
import { ThemeContext } from '../styles';

export default class LineSeparator extends PureComponent<{||}> {
  static contextType = ThemeContext;
  context: ThemeColors;

  styles = {
    lineSeparator: {
      height: 1,
      margin: 4,
    },
  };

  render() {
    return (
      <View style={[this.styles.lineSeparator, { backgroundColor: this.context.cardColor }]} />
    );
  }
}
