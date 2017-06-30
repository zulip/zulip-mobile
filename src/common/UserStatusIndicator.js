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
  active: { // eslint-disable-line
    backgroundColor: '#44c21d',
  },
  idle: { // eslint-disable-line
    backgroundColor: 'rgba(255, 165, 0, 1)',
  },
  offline: { // eslint-disable-line
    backgroundColor: 'lightgray',
  },
});


export default class UserStatusIndicator extends Component {

  props: {
    status: string,
    style: StyleObj,
  }

  static defaultProps = {
    status: 'unknown',
  };

  render() {
    const { status, style } = this.props;

    if (!status) return null;

    return (
      <View style={[styles.common, styles[status], style]} />
    );
  }
}
