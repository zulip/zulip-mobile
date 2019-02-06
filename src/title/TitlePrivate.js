/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { User } from '../types';
import { Avatar, ViewPlaceholder } from '../common';
import ActivityText from './ActivityText';
import { getAllUsersByEmail } from '../users/userSelectors';
import styles from '../styles';

type Props = {
  user: User,
  color: string,
};

class TitlePrivate extends PureComponent<Props> {
  render() {
    const { user, color } = this.props;

    return (
      <View style={styles.navWrapper}>
        <Avatar size={32} name={user.full_name} email={user.email} avatarUrl={user.avatar_url} />
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
  user: getAllUsersByEmail(state)[props.email],
}))(TitlePrivate);
