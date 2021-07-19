/* @flow strict-local */
import React from 'react';
import { FlatList } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import type { UserId, UserOrBot } from '../types';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  reactedUserIds: $ReadOnlyArray<UserId>,
|}>;

/**
 * Component showing who made a given reaction on a given message.
 *
 * Used within `MessageReactionsScreen`.
 */
export default function ReactionUserList(props: Props): React$Node {
  const { reactedUserIds } = props;

  return (
    <FlatList
      data={reactedUserIds}
      keyExtractor={userId => `${userId}`}
      renderItem={({ item }) => (
        <UserItem
          key={item}
          userId={item}
          onPress={(user: UserOrBot) => {
            NavigationService.dispatch(navigateToAccountDetails(user.user_id));
          }}
        />
      )}
    />
  );
}
