/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { StyleObj } from '../types';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  frame: {
    paddingTop: 2,
    paddingRight: 4,
    paddingBottom: 2,
    paddingLeft: 4,
    backgroundColor: BRAND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 12,
  },
  frameInverse: {
    backgroundColor: 'white',
  },
  textInverse: {
    color: BRAND_COLOR,
  },
});

export default class UnreadCount extends PureComponent {
  props: {
    style?: StyleObj,
    color?: string,
    borderRadius: number,
    count?: number,
    inverse?: boolean,
  };

  static defaultProps = {
    color: BRAND_COLOR,
    borderRadius: 2,
  };

  render() {
    const { style, borderRadius, color, count, inverse } = this.props;

    if (!count) return null;

    const frameStyle = [
      styles.frame,
      inverse && styles.frameInverse,
      { borderRadius },
      { backgroundColor: color },
      style,
    ];

    const textStyle = [styles.text, inverse && styles.textInverse];

    return (
      <View style={frameStyle}>
        <Text style={textStyle}>
          {count < 100 ? count : '99+'}
        </Text>
      </View>
    );
  }
}
