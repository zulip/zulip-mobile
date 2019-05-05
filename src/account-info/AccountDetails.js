/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { User, Dispatch } from '../types';
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

type Props = {|
  user: User,

  dispatch: Dispatch,
  ...SelectorProps,
|};

class AccountDetails extends PureComponent<Props, void> {
  render() {
    const { realm, user, userStatusText } = this.props;

    return (
      <View>
        <ComponentList outerSpacing itemStyle={componentStyles.componentListItem}>
          <View>
            <UserAvatar
              avatarUrl={getAvatarFromUser(user, realm, AVATAR_SIZE)}
              size={AVATAR_SIZE}
            />
          </View>
          <View style={componentStyles.statusWrapper}>
            <PresenceStatusIndicator email={user.email} hideIfOffline={false} />
            <RawLabel style={[styles.largerText, styles.halfMarginLeft]} text={user.email} />
          </View>
          {userStatusText !== undefined && (
            <RawLabel
              style={[styles.largerText, componentStyles.statusText]}
              text={userStatusText}
            />
          )}
          <View>
            <ActivityText style={styles.largerText} user={user} />
          </View>
          {user.timezone ? (
            <View>
              <RawLabel
                style={styles.largerText}
                text={`${nowInTimeZone(user.timezone)} Local time`}
              />
            </View>
          ) : null}
        </ComponentList>
      </View>
    );
  }
}

export default connect((state, props): SelectorProps => ({
  realm: getCurrentRealm(state),
  userStatusText: getUserStatusTextForUser(state, props.user.user_id),
}))(AccountDetails);
