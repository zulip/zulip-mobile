/* @flow strict-local */
import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { UserId, UserOrBot } from '../types';
import AvatarItem from './AvatarItem';

type Props = $ReadOnly<{|
  users: UserOrBot[],
  listRef: React$Ref<typeof FlatList>,
  onPress: UserId => void,
|}>;

export default class AvatarList extends PureComponent<Props> {
  render(): Node {
    const { listRef, users, onPress } = this.props;

    return (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        initialNumToRender={20}
        data={users}
        ref={listRef}
        keyExtractor={user => String(user.user_id)}
        renderItem={({ item: user }) => <AvatarItem user={user} onPress={onPress} />}
      />
    );
  }
}
