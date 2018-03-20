/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { User } from '../types';
import { Avatar } from '../common';
import { presenceToHumanTime } from '../utils/date';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    paddingLeft: 8,
  },
  time: {
    fontSize: 13,
    paddingLeft: 8,
  },
});

type Props = {
  user: User,
  color: string,
  presences: Object,
};

export default class TitlePrivate extends PureComponent<Props> {
  render() {
    const { presences, user, color } = this.props;
    const { fullName, avatarUrl, email } = user;
    const activity = presenceToHumanTime(presences[email]);

    return (
      <View style={styles.wrapper}>
        <Avatar size={32} name={fullName} email={email} avatarUrl={avatarUrl} />
        <View>
          <Text style={[styles.title, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {fullName}
          </Text>
          <Text style={[styles.time, { color }]}>Active {activity}</Text>
        </View>
      </View>
    );
  }
}
