/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { Dispatch, PmConversationData, UserOrBot } from '../types';
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

  handleGroupNarrow = (users: PmKeyUsers) => {
    this.props.dispatch(doNarrow(pmNarrowFromUsers(users)));
  };

  render() {
    const { conversations } = this.props;

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
