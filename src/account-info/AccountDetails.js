/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { UserOrBot, Dispatch } from '../types';
import { connect } from '../react-redux';
import { UserAvatar, ComponentList, RawLabel } from '../common';
import { getCurrentRealm, getUserStatusTextForUser } from '../selectors';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import ActivityText from '../title/ActivityText';
import { getAvatarFromUser } from '../utils/avatar';
import { nowInTimeZone } from '../utils/date';
import styles from '../styles';

const componentStyles = StyleSheet.create({
  componentListItem: {
    alignItems: 'center',
  },
  statusWrapper: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  statusText: {
    textAlign: 'center',
  },
});

const AVATAR_SIZE = 200;

type SelectorProps = {|
  realm: string,
  userStatusText: string | void,
|};

type Props = $ReadOnly<{|
  user: UserOrBot,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class AccountDetails extends PureComponent<Props> {
  render() {
    const { realm, user, userStatusText } = this.props;

    // The set of timezone names in the tz database is subject to change over
    // time. Handle unrecognized timezones by quietly discarding them.
    let localTime: string | null;
    try {
      localTime =
        user.timezone !== undefined && user.timezone !== ''
          ? `${nowInTimeZone(user.timezone)} Local time`
          : null;
    } catch (err) {
      localTime = null;
    }

    return (
      <ComponentList outerSpacing itemStyle={componentStyles.componentListItem}>
        <View>
          <UserAvatar avatarUrl={getAvatarFromUser(user, realm, AVATAR_SIZE)} size={AVATAR_SIZE} />
        </View>
        <View style={componentStyles.statusWrapper}>
          <RawLabel style={[styles.largerText, styles.halfMarginRight]} text={user.full_name} />
          <PresenceStatusIndicator email={user.email} hideIfOffline={false} />
        </View>
        {userStatusText !== undefined && (
          <RawLabel style={[styles.largerText, componentStyles.statusText]} text={userStatusText} />
        )}
        <View>
          <ActivityText style={styles.largerText} user={user} />
        </View>
        {user.timezone !== '' && user.timezone !== undefined ? (
          <View>
            {localTime !== null && <RawLabel style={styles.largerText} text={localTime} />}
          </View>
        ) : null}
      </ComponentList>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  realm: getCurrentRealm(state),
  userStatusText: getUserStatusTextForUser(state, props.user.user_id),
}))(AccountDetails);
