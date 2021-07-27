/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { FlatList } from 'react-native';
import { useDispatch, useSelector } from '../react-redux';

import type { PmConversationData, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { type PmKeyUsers } from '../utils/recipient';
import { pm1to1NarrowFromUser, pmNarrowFromUsers } from '../utils/narrow';
import UserItem from '../users/UserItem';
import GroupPmConversationItem from './GroupPmConversationItem';
import { doNarrow } from '../actions';
import { getMutedUsers } from '../selectors';

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
export default function PmConversationList(props: Props): Node {
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
  const mutedUsers = useSelector(getMutedUsers);

  return (
    <FlatList
      style={styles.list}
      initialNumToRender={20}
      data={conversations}
      keyExtractor={item => item.key}
      renderItem={({ item }) => {
        const users = item.keyRecipients;
        if (users.length === 1) {
          const user_id = users[0].user_id;
          if (mutedUsers.has(user_id)) {
            return null;
          } else {
            return (
              <UserItem userId={user_id} unreadCount={item.unread} onPress={handleUserNarrow} />
            );
          }
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
