/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { RealmBot, User } from '../types';
import { UserAvatarWithPresence, ViewPlaceholder } from '../common';
import ActivityText from './ActivityText';
import { getAllUsersByEmail } from '../users/userSelectors';
import styles from '../styles';

type Props = {
  user: User | RealmBot,
  color: string,
};

class TitlePrivate extends PureComponent<Props> {
  render() {
    const { user, color } = this.props;
    // $FlowFixMe: sort out RealmBot
    const avatarUrl: string | null = user.avatar_url;
    return (
      <View style={styles.navWrapper}>
        <UserAvatarWithPresence size={32} email={user.email} avatarUrl={avatarUrl} />
        <ViewPlaceholder width={8} />
        <View>
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {user.full_name}
          </Text>
          <ActivityText style={styles.navSubtitle} color={color} email={user.email} />
        </View>
      </View>
    );
  }
}

export default connect((state, props) => ({
  user: getAllUsersByEmail(state).get(props.email),
}))(TitlePrivate);
