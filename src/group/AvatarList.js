/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { User } from '../types';
import { Avatar, ComponentWithOverlay } from '../common';
import { IconCancel } from '../common/Icons';

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
            <ComponentWithOverlay
              overlaySize={20}
              overlayColor="white"
              overlayPosition="bottom-right"
              overlay={<IconCancel color="gray" size={20} />}
              onPress={() => onPress(item.email)}>
              <Avatar
                key={item.email}
                size={52}
                avatarUrl={item.avatarUrl}
                name={item.fullName}
                status={item.status}
              />
            </ComponentWithOverlay>}
        />
      </View>
    );
  }
}
