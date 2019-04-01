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
  },
  active: {
    backgroundColor: 'hsl(106, 74%, 44%)',
  },
  idleWrapper: {
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 1)',
  },
  idleHalfCircle: {
    backgroundColor: 'rgba(255, 165, 0, 1)',
    width: 8,
    height: 4,
    marginTop: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  offline: {
    backgroundColor: 'gray',
  },
  unavailableWrapper: {
    borderColor: 'gray',
    borderWidth: 1.5,
  },
  unavailableLine: {
    backgroundColor: 'gray',
    marginVertical: 3.5,
    marginHorizontal: 1.5,
    height: 2,
  },
});

const PresenceStatusIndicatorActive = ({ style }: { style: Style }) => (
  <View style={[styles.active, styles.common, style]} />
);

const PresenceStatusIndicatorIdle = ({ style }: { style: Style }) => (
  <View style={[styles.idleWrapper, styles.common, style]}>
    <View style={styles.idleHalfCircle} />
  </View>
);

const PresenceStatusIndicatorOffline = ({ style }: { style: Style }) => (
  <View style={[styles.offline, styles.common, style]} />
);

const PresenceStatusIndicatorUnavailable = ({ style }: { style: Style }) => (
  <View style={[styles.unavailableWrapper, styles.common, style]}>
    <View style={styles.unavailableLine} />
  </View>
);

type OwnProps = {|
  style?: Style,
  email: string,
  hideIfOffline: boolean,
|};

type StateProps = {|
  presence: PresenceState,
  usersByEmail: Map<string, User>,
  userStatus: UserStatusMapObject,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
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

    switch (status) {
      case 'active':
        return <PresenceStatusIndicatorActive style={style} />;

      case 'idle':
        return <PresenceStatusIndicatorIdle style={style} />;

      case 'offline':
        return <PresenceStatusIndicatorOffline style={style} />;

      case 'unavailable':
        return <PresenceStatusIndicatorUnavailable style={style} />;

      default:
        (status: empty); // eslint-disable-line no-unused-expressions
        return null;
    }
  }
}

export default connect((state: GlobalState) => ({
  presence: getPresence(state),
  usersByEmail: getUsersByEmail(state),
  userStatus: getUserStatus(state),
}))(PresenceStatusIndicator);
