/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node as React$Node } from 'react';
import { View, StyleSheet } from 'react-native';

import type { ThemeColors } from '../styles';
import { ThemeContext } from '../styles';

const styles = StyleSheet.create({
  popup: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 5,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 3,
    maxHeight: 250,
  },
});

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

export default class Popup extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeColors;

  render() {
    return (
      <View style={[{ backgroundColor: this.context.backgroundColor }, styles.popup]}>
        {this.props.children}
      </View>
    );
  }
}
