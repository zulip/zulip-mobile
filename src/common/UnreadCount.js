/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  frame: {
    paddingTop: 2,
    paddingRight: 4,
    paddingBottom: 2,
    paddingLeft: 4,
    borderRadius: 2,
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
    count?: number,
    inverse?: boolean,
  };

  render() {
    const { count, inverse } = this.props;

    if (!count) return null;

    return (
      <View style={[styles.frame, inverse && styles.frameInverse]}>
        <Text style={[styles.text, inverse && styles.textInverse]}>
          {count < 100 ? count : '99+'}
        </Text>
      </View>
    );
  }
}
