/* @flow */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { StyleObj, Presence } from '../types';

const styles = StyleSheet.create({
  common: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: 'white',
    borderWidth: 2,
  },
  active: {
    backgroundColor: '#44c21d',
  },
  idle: {
    backgroundColor: 'rgba(255, 165, 0, 1)',
  },
  offline: {
    backgroundColor: 'lightgray',
  },
});

export default class UserStatusIndicator extends PureComponent {
  props: {
    style: StyleObj,
    presence?: Presence,
  };

  render() {
    const { presence, style } = this.props;

    if (!presence || !presence.aggregated) return null;

    return <View style={[styles.common, styles[presence.aggregated.status], style]} />;
  }
}
