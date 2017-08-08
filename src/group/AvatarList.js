/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Avatar } from '../common';
import { User } from '../types';

const styles = StyleSheet.create({
  selected: {
    height: 52,
  },

  list: {},
});

export default class UserList extends PureComponent {
  props: {
    users: User[],
    onPress: (email: string) => void,
  };

  render() {
    const { users, onPress } = this.props;

    return (
      <View style={styles.selected}>
        <FlatList
          style={styles.list}
          horizontal
          initialNumToRender={20}
          data={users}
          keyExtractor={item => item.email}
          renderItem={({ item }) =>
            <Avatar
              key={item.email}
              size={52}
              avatarUrl={item.avatarUrl}
              name={item.fullName}
              status={item.status}
              onPress={() => onPress(item.email)}
            />}
        />
      </View>
    );
  }
}
