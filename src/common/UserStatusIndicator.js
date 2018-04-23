/* @flow */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import connectWithActions from '../connectWithActions';
import { getPresence } from '../selectors';
import type { StyleObj, PresenceState } from '../types';
import { statusFromPresence } from '../users/userHelpers';

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
  email: string,
  presences: PresenceState,
  style: StyleObj,
};

class UserStatusIndicator extends PureComponent<Props> {
  props: Props;

  render() {
    const { email, presences, style } = this.props;
    const presence = presences[email];
    if (!presence || !presence.aggregated) return null;

    const status = statusFromPresence(presence);
    return <View style={[styles.common, styles[status], style]} />;
  }
}

export default connectWithActions(state => ({
  presences: getPresence(state),
}))(UserStatusIndicator);
