/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { GlobalState, User, UserStatusMapObject } from '../types';
import { Avatar, ComponentList, RawLabel } from '../common';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import { getUserStatus } from '../selectors';
import ActivityText from '../title/ActivityText';
import { getMediumAvatar } from '../utils/avatar';
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

type Props = {|
  user: User,
  userStatus: UserStatusMapObject,
|};

class AccountDetails extends PureComponent<Props, void> {
  render() {
    const { user, userStatus } = this.props;
    const screenWidth = Dimensions.get('window').width;
    const statusText = userStatus[user.user_id] && userStatus[user.user_id].status_text;

    return (
      <View>
        <Avatar
          avatarUrl={typeof user.avatar_url === 'string' ? getMediumAvatar(user.avatar_url) : null}
          name={user.full_name}
          email={user.email}
          size={screenWidth}
          shape="square"
        />
        <ComponentList outerSpacing itemStyle={componentStyles.componentListItem}>
          <View style={componentStyles.statusWrapper}>
            <PresenceStatusIndicator email={user.email} hideIfOffline={false} />
            <RawLabel style={[styles.largerText, styles.halfMarginLeft]} text={user.email} />
          </View>
          {statusText !== undefined && (
            <RawLabel style={[styles.largerText, componentStyles.statusText]} text={statusText} />
          )}
          <View>
            <ActivityText style={styles.largerText} email={user.email} />
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

export default connect((state: GlobalState) => ({
  userStatus: getUserStatus(state),
}))(AccountDetails);
