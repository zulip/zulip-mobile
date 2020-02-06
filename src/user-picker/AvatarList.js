/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { User } from '../types';
import AvatarItem from './AvatarItem';

type Props = $ReadOnly<{|
  users: User[],
  listRef: (component: FlatList<User> | null) => void,
  onPress: (email: string) => void,
|}>;

export default class AvatarList extends PureComponent<Props> {
  render() {
    const { listRef, users, onPress } = this.props;

    return (
      <FlatList
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
