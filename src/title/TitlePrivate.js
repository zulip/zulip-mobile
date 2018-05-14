/* @flow */
import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { PresenceState, User } from '../types';
import { Avatar, ViewPlaceholder } from '../common';
import ActivityText from './ActivityText';

type Props = {
  user: User,
  color: string,
  presence: PresenceState,
};

export default class TitlePrivate extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { user, color, presence } = this.props;
    const { fullName, avatarUrl, email } = user;

    return (
      <View style={styles.navWrapper}>
        <Avatar
          size={32}
          name={fullName}
          email={email}
          avatarUrl={avatarUrl}
          presence={presence[email]}
        />
        <ViewPlaceholder width={8} />
        <View>
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {fullName}
          </Text>
          <ActivityText style={styles.navSubtitle} color={color} email={email} />
        </View>
      </View>
    );
  }
}
