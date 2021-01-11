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
  maybeOpaqueBackgroundWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  opaqueBackground: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: 'white',
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

function MaybeOpaqueBackgroundWrapper(
  props: $ReadOnly<{|
    useOpaqueBackground: boolean,
    style?: ViewStyleProp,
    children: React$Node,
  |}>,
) {
  const { useOpaqueBackground, style, children } = props;
  return (
    <View
      style={[
        styles.maybeOpaqueBackgroundWrapper,
        useOpaqueBackground ? styles.opaqueBackground : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const PresenceStatusIndicatorActive = () => <View style={[styles.active, styles.common]} />;

const PresenceStatusIndicatorIdle = () => (
  <View style={[styles.idleWrapper, styles.common]}>
    <View style={styles.idleHalfCircle} />
  </View>
);

const PresenceStatusIndicatorOffline = () => <View style={[styles.offline, styles.common]} />;

const PresenceStatusIndicatorUnavailable = () => (
  <View style={[styles.unavailableWrapper, styles.common]}>
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
  useOpaqueBackground: boolean,
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
    const {
      email,
      presence,
      style,
      hideIfOffline,
      allUsersByEmail,
      userStatus,
      useOpaqueBackground,
    } = this.props;

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
        return (
          <MaybeOpaqueBackgroundWrapper style={style} useOpaqueBackground={useOpaqueBackground}>
            <PresenceStatusIndicatorActive />
          </MaybeOpaqueBackgroundWrapper>
        );

      case 'idle':
        return (
          <MaybeOpaqueBackgroundWrapper style={style} useOpaqueBackground={useOpaqueBackground}>
            <PresenceStatusIndicatorIdle />
          </MaybeOpaqueBackgroundWrapper>
        );

      case 'offline':
        return (
          <MaybeOpaqueBackgroundWrapper style={style} useOpaqueBackground={useOpaqueBackground}>
            <PresenceStatusIndicatorOffline />
          </MaybeOpaqueBackgroundWrapper>
        );

      case 'unavailable':
        return (
          <MaybeOpaqueBackgroundWrapper style={style} useOpaqueBackground={useOpaqueBackground}>
            <PresenceStatusIndicatorUnavailable />
          </MaybeOpaqueBackgroundWrapper>
        );

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
