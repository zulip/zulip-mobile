/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { User } from '../types';
import AvatarItem from './AvatarItem';

const styles = StyleSheet.create({
  list: {},
});

type Props = {|
  users: User[],
  listRef: (component: FlatList<*> | null) => void,
  onPress: (email: string) => void,
|};

export default class AvatarList extends PureComponent<Props> {
  render() {
    const { listRef, users, onPress } = this.props;

    return (
      <FlatList
        style={styles.list}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialNumToRender={20}
        data={users}
        ref={(component: FlatList<User> | null) => {
          if (listRef) {
            listRef(component);
          }
        }}
        keyExtractor={item => item.email}
        renderItem={({ item }) => (
          <AvatarItem
            email={item.email}
            avatarUrl={item.avatar_url}
            fullName={item.full_name}
            onPress={onPress}
          />
        )}
      />
    );
  }
}
