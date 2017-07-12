/* @flow */
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj } from '../types';

const styles = StyleSheet.create({
  common: {
    width: 12,
    height: 12,
    borderRadius: 100,
    borderColor: 'white',
    borderWidth: 2,
  },
  /* eslint-disable react-native/no-unused-styles */
  active: {
    backgroundColor: '#44c21d',
  },
  idle: {
    backgroundColor: 'rgba(255, 165, 0, 1)',
  },
  offline: {
    backgroundColor: 'lightgray',
  },
  /* eslint-enable react-native/no-unused-styles */
});

export default class UserStatusIndicator extends Component {
  props: {
    status: string,
    style: StyleObj,
  };

  static defaultProps = {
    status: 'unknown',
  };

  render() {
    const { status, style } = this.props;

    if (!status) return null;

    return <View style={[styles.common, styles[status], style]} />;
  }
}
