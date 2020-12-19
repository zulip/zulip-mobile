/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { UserId, UserOrBot } from '../types';
import AvatarItem from './AvatarItem';

type Props = $ReadOnly<{|
  users: UserOrBot[],
  listRef: (component: FlatList<UserOrBot> | null) => void,
  onPress: UserId => void,
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
        ref={(component: FlatList<UserOrBot> | null) => {
          if (listRef) {
            listRef(component);
          }
        }}
        keyExtractor={user => String(user.user_id)}
        renderItem={({ item: user }) => <AvatarItem user={user} onPress={onPress} />}
      />
    );
  }
}
