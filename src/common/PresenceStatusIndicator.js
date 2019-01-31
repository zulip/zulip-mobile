/* @flow strict-local */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Style, UserPresence } from '../types';
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

type Props = {|
  style?: Style,
  presence?: UserPresence,
  hideIfOffline: boolean,
|};

/**
 * A colored dot indicating user online status.
 * * green if 'online'
 * * orange if 'idle'
 * * gray if 'offline'
 *
 * @prop [style] - Style object for additional customization.
 * @prop [presence] - UserPresence object used to determine the status from.
 * @prop hideIfOffline - Do not render for 'offline' state.
 */
export default class PresenceStatusIndicator extends PureComponent<Props> {
  render() {
    const { presence, style, hideIfOffline } = this.props;

    if (!presence || !presence.aggregated) {
      return null;
    }

    const status = statusFromPresence(presence);

    if (hideIfOffline && status === 'offline') {
      return null;
    }

    return <View style={[styles.common, styles[status], style]} />;
  }
}
