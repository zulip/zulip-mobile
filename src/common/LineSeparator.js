/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';

const componentStyles = createStyleSheet({
  lineSeparator: {
    height: 1,
    margin: 4,
  },
});

export default class LineSeparator extends PureComponent<{||}> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    return (
      <View style={[componentStyles.lineSeparator, { backgroundColor: this.context.cardColor }]} />
    );
  }
}
