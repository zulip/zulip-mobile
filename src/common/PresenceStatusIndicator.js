/* @flow strict-local */
/* eslint-disable react-native/no-unused-styles */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { GlobalState, Style, PresenceState, User, UserStatusMapObject } from '../types';
import { statusFromPresenceAndUserStatus } from '../utils/presence';
import { getPresence, getUserStatus } from '../selectors';
import { getUsersByEmail } from '../users/userSelectors';

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
  usersByEmail: Map<string, User>,
  userStatus: UserStatusMapObject,
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
    const { email, presence, style, hideIfOffline, usersByEmail, userStatus } = this.props;

    const userPresence = presence[email];
    const user = usersByEmail.get(email);

    if (!user || !userPresence || !userPresence.aggregated) {
      return null;
    }

    const status = statusFromPresenceAndUserStatus(userPresence, userStatus[user.user_id]);

    if (hideIfOffline && status === 'offline') {
      return null;
    }

    return <View style={[styles.common, styles[status], style]} />;
  }
}

export default connect((state: GlobalState) => ({
  presence: getPresence(state),
  usersByEmail: getUsersByEmail(state),
  userStatus: getUserStatus(state),
}))(PresenceStatusIndicator);
