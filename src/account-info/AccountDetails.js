/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

import type { User } from '../types';
import { UserAvatar, ComponentList, RawLabel } from '../common';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import ActivityText from '../title/ActivityText';
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
});

type Props = {|
  user: User,
|};

export default class AccountDetails extends PureComponent<Props, void> {
  render() {
    const { user } = this.props;
    const screenWidth = Dimensions.get('window').width;

    return (
      <View>
        <UserAvatar
          avatarUrl={user.avatar_url}
          email={user.email}
          size={screenWidth}
          shape="square"
          useProgressiveImage
        />
        <ComponentList outerSpacing itemStyle={componentStyles.componentListItem}>
          <View style={componentStyles.statusWrapper}>
            <PresenceStatusIndicator email={user.email} hideIfOffline={false} />
            <RawLabel style={[styles.largerText, styles.halfMarginLeft]} text={user.email} />
          </View>
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
