/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { Dispatch, PmConversationData, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { pm1to1NarrowFromUser, pmNarrowFromEmails } from '../utils/narrow';
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
  dispatch: Dispatch,
  conversations: PmConversationData[],
  allUsersByEmail: Map<string, UserOrBot>,
|}>;

/**
 * A list describing all PM conversations.
 * */
export default class PmConversationList extends PureComponent<Props> {
  handleUserNarrow = (user: UserOrBot) => {
    this.props.dispatch(doNarrow(pm1to1NarrowFromUser(user)));
  };

  handleGroupNarrow = (users: $ReadOnlyArray<UserOrBot>) => {
    this.props.dispatch(doNarrow(pmNarrowFromEmails(users.map(u => u.email))));
  };

  render() {
    const { conversations, allUsersByEmail } = this.props;

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={20}
        data={conversations}
        keyExtractor={item => item.recipients}
        renderItem={({ item }) => {
          const users = [];
          for (const email of item.recipients.split(',')) {
            const user = allUsersByEmail.get(email);
            if (!user) {
              return null;
            }
            users.push(user);
          }

          if (users.length === 1) {
            return (
              <UserItem user={users[0]} unreadCount={item.unread} onPress={this.handleUserNarrow} />
            );
          } else {
            return (
              <GroupPmConversationItem
                users={users}
                unreadCount={item.unread}
                onPress={this.handleGroupNarrow}
              />
            );
          }
        }}
      />
    );
  }
}
