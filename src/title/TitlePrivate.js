/* @flow */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NULL_USER } from '../nullObjects';
import { Avatar } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    paddingLeft: 4,
  },
});

export default class TitlePrivate extends React.PureComponent {
  render() {
    const { narrow, realm, users, color } = this.props;
    const { fullName, avatarUrl } = users.find(x => x.email === narrow[0].operand) || NULL_USER;

    return (
      <View style={styles.wrapper}>
        <Avatar size={24} name={fullName} avatarUrl={avatarUrl} realm={realm} />
        <Text style={[styles.title, { color }]}>
          {fullName}
        </Text>
      </View>
    );
  }
}
