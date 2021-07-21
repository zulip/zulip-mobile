/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext, createStyleSheet } from '../styles';

const componentStyles = createStyleSheet({
  divider: {
    borderBottomWidth: 1,
  },
});

export default class OptionDivider extends PureComponent<{||}> {
  static contextType = ThemeContext;
  context: ThemeData;

  render() {
    return (
      <View style={[componentStyles.divider, { borderBottomColor: this.context.dividerColor }]} />
    );
  }
}
