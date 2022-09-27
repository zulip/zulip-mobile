/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { UserId, UserOrBot } from '../types';
import AvatarItem from './AvatarItem';

type Props = $ReadOnly<{|
  users: $ReadOnlyArray<UserOrBot>,
  listRef: React$Ref<typeof FlatList>,
  onPress: UserId => void,
|}>;

export default function AvatarList(props: Props): Node {
  const { listRef, users, onPress } = props;

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
