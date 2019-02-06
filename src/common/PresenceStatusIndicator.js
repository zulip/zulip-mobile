/* @flow strict-local */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { GlobalState, Style, PresenceState } from '../types';
import { statusFromPresence } from '../utils/presence';
import { getPresence } from '../selectors';

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

type PropsFromConnect = {|
  presence: PresenceState,
|};

type Props = {|
  ...PropsFromConnect,
  style?: Style,
  email: string,
  hideIfOffline: boolean,
|};

/**
 * A colored dot indicating user online status.
 * * green if 'online'
 * * orange if 'idle'
 * * gray if 'offline'
 *
 * @prop [style] - Style object for additional customization.
 * @prop email - email of the user whose status we are showing.
 * @prop hideIfOffline - Do not render for 'offline' state.
 */
class PresenceStatusIndicator extends PureComponent<Props> {
  render() {
    const { email, presence, style, hideIfOffline } = this.props;

    const userPresence = presence[email];

    if (!userPresence || !userPresence.aggregated) {
      return null;
    }

    const status = statusFromPresence(userPresence);

    if (hideIfOffline && status === 'offline') {
      return null;
    }

    return <View style={[styles.common, styles[status], style]} />;
  }
}

export default connect((state: GlobalState) => ({
  presence: getPresence(state),
}))(PresenceStatusIndicator);
