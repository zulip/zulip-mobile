/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { User } from '../types';
import { Avatar } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    paddingLeft: 8,
  },
});

type Props = {
  user: User,
  color: string,
};

export default class TitlePrivate extends PureComponent<Props> {
  render() {
    const { user, color } = this.props;
    const { fullName, avatarUrl, email } = user;

    return (
      <View style={styles.wrapper}>
        <Avatar size={24} name={fullName} email={email} avatarUrl={avatarUrl} />
        <Text style={[styles.title, { color }]}>{fullName}</Text>
      </View>
    );
  }
}
