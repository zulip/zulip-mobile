/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Actions } from '../types';
import { Avatar } from '../common';

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    padding: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
  text: {
    flex: 1,
  },
  avatar: {
    marginRight: 8,
  },
});

type Props = {
  actions: Actions,
  users: Object[],
};

export default class MessageTyping extends PureComponent<Props> {
  props: Props;

  handleAvatarPress = (email: string) => this.props.actions.navigateToAccountDetails(email);

  render() {
    const { users } = this.props;
    const text = `... ${users.length > 1 ? 'are' : 'is'} typing`;

    return (
      <View style={styles.message}>
        {users.map(user => (
          <View key={user.email} style={styles.avatar}>
            <Avatar
              avatarUrl={user.avatarUrl}
              email={user.email}
              name={user.fullName}
              onPress={() => this.handleAvatarPress(user.email)}
            />
          </View>
        ))}
        <Text style={styles.text}>{text}</Text>
      </View>
    );
  }
}
