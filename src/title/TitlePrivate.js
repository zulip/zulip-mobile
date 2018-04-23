/* @flow */
import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';

import type { User } from '../types';
import { Avatar } from '../common';
import ActivityText from './ActivityText';

type Props = {
  user: User,
  color: string,
};

export default class TitlePrivate extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { user, color } = this.props;
    const { fullName, avatarUrl, email } = user;

    return (
      <View style={styles.navWrapper}>
        <Avatar size={32} name={fullName} email={email} avatarUrl={avatarUrl} />
        <View>
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {fullName}
          </Text>
          <ActivityText color={color} email={email} />
        </View>
      </View>
    );
  }
}
