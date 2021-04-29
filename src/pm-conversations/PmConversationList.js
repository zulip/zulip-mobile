/* @flow strict-local */
import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { useDispatch } from '../react-redux';

import type { PmConversationData, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { type PmKeyUsers } from '../utils/recipient';
import { pm1to1NarrowFromUser, pmNarrowFromUsers } from '../utils/narrow';
import UserItem from '../users/UserItem';
import GroupPmConversationItem from './GroupPmConversationItem';
import { doNarrow } from '../actions';

const styles = createStyleSheet({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = $ReadOnly<{|
  conversations: PmConversationData[],
|}>;

/**
 * A list describing all PM conversations.
 * */
export default function PmConversationList(props: Props) {
  const dispatch = useDispatch();

  const handleUserNarrow = useCallback(
    (user: UserOrBot) => {
      dispatch(doNarrow(pm1to1NarrowFromUser(user)));
    },
    [dispatch],
  );

  const handleGroupNarrow = useCallback(
    (users: PmKeyUsers) => {
      dispatch(doNarrow(pmNarrowFromUsers(users)));
    },
    [dispatch],
  );

  const { conversations } = props;

  return (
    <FlatList
      style={styles.list}
      initialNumToRender={20}
      data={conversations}
      keyExtractor={item => item.key}
      renderItem={({ item }) => {
        const users = item.keyRecipients;
        if (users.length === 1) {
          return (
            <UserItem
              userId={users[0].user_id}
              unreadCount={item.unread}
              onPress={handleUserNarrow}
            />
          );
        } else {
          return (
            <GroupPmConversationItem
              users={users}
              unreadCount={item.unread}
              onPress={handleGroupNarrow}
            />
          );
        }
      }}
    />
  );
}
