/* @flow */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Style, Presence } from '../types';
import { statusFromPresence } from '../utils/presence';

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

type Props = {
  style: Style,
  presence?: Presence,
};

export default class UserStatusIndicator extends PureComponent<Props> {
  props: Props;

  render() {
    const { presence, style } = this.props;

    if (!presence || !presence.aggregated) return null;

    const status = statusFromPresence(presence);
    return <View style={[styles.common, styles[status], style]} />;
  }
}
