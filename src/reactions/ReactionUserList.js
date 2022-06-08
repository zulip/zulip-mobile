/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';

import type { UserId, UserOrBot } from '../types';
import UserItem from '../users/UserItem';
import { useNavigation } from '../react-navigation';

type Props = $ReadOnly<{|
  reactedUserIds: $ReadOnlyArray<UserId>,
|}>;

/**
 * Component showing who made a given reaction on a given message.
 *
 * Used within `MessageReactionsScreen`.
 */
export default function ReactionUserList(props: Props): Node {
  const { reactedUserIds } = props;
  const navigation = useNavigation();

  return (
    <FlatList
      data={reactedUserIds}
      keyExtractor={userId => `${userId}`}
      renderItem={({ item }) => (
        <UserItem
          key={item}
          userId={item}
          onPress={(user: UserOrBot) => {
            navigation.push('account-details', { userId: user.user_id });
          }}
        />
      )}
    />
  );
}
