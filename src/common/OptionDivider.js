/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeColors } from '../styles';
import { ThemeContext } from '../styles';

export default class OptionDivider extends PureComponent<{||}> {
  static contextType = ThemeContext;
  context: ThemeColors;

  styles = {
    divider: {
      borderBottomWidth: 1,
    },
  };

  render() {
    return <View style={[this.styles.divider, { borderBottomColor: this.context.dividerColor }]} />;
  }
}
