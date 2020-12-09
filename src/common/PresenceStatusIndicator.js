/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { PresenceState, UserOrBot, UserStatusMapObject, Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { statusFromPresenceAndUserStatus } from '../utils/presence';
import { getPresence, getUserStatus } from '../selectors';
import { getAllUsersByEmail } from '../users/userSelectors';
import { ensureUnreachable } from '../types';

const styles = createStyleSheet({
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
    borderColor: 'hsl(39, 100%, 50%)',
  },
  idleHalfCircle: {
    backgroundColor: 'hsl(39, 100%, 50%)',
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

const PresenceStatusIndicatorActive = ({ style }: { style: ViewStyleProp }) => (
  <View style={[styles.active, styles.common, style]} />
);

const PresenceStatusIndicatorIdle = ({ style }: { style: ViewStyleProp }) => (
  <View style={[styles.idleWrapper, styles.common, style]}>
    <View style={styles.idleHalfCircle} />
  </View>
);

const PresenceStatusIndicatorOffline = ({ style }: { style: ViewStyleProp }) => (
  <View style={[styles.offline, styles.common, style]} />
);

const PresenceStatusIndicatorUnavailable = ({ style }: { style: ViewStyleProp }) => (
  <View style={[styles.unavailableWrapper, styles.common, style]}>
    <View style={styles.unavailableLine} />
  </View>
);

type PropsFromConnect = {|
  dispatch: Dispatch,
  presence: PresenceState,
  allUsersByEmail: Map<string, UserOrBot>,
  userStatus: UserStatusMapObject,
|};

type Props = $ReadOnly<{|
  ...PropsFromConnect,
  style?: ViewStyleProp,
  email: string,
  hideIfOffline: boolean,
|}>;

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
    const { email, presence, style, hideIfOffline, allUsersByEmail, userStatus } = this.props;

    const userPresence = presence[email];
    const user = allUsersByEmail.get(email);

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
        ensureUnreachable(status);
        return null;
    }
  }
}

export default connect(state => ({
  presence: getPresence(state),
  allUsersByEmail: getAllUsersByEmail(state),
  userStatus: getUserStatus(state),
}))(PresenceStatusIndicator);
