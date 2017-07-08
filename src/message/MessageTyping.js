/* @flow */
import React from 'react';
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

export default class MessageTyping extends React.PureComponent {
  props: {
    actions: Actions,
    avatarUrl?: string,
    fromName?: string,
    fromEmail?: string,
    users: Object[],
  };

  handleAvatarPress = (email: string) => this.props.actions.pushRoute('account-details', email);

  render() {
    const { users } = this.props;
    const text = `... ${users.length > 1 ? 'are' : 'is'} typing`;

    return (
      <View style={styles.message}>
        {users.map(user => (
          <View key={user.email} style={styles.avatar}>
            <Avatar
              avatarUrl={user.avatarUrl}
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
