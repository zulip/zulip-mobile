/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { connect } from '../react-redux';
import type { Dispatch, PmConversationData, User, UserOrBot } from '../types';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import UserItem from '../users/UserItem';
import { getOwnUser } from '../users/userSelectors';
import GroupPmConversationItem from './GroupPmConversationItem';
import { doNarrow } from '../actions';
import { normalizeUsersSansMe } from '../utils/recipient';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type SelectorProps = $ReadOnly<{|
  ownUser: User,
|}>;

type Props = $ReadOnly<{|
  ...SelectorProps,
  dispatch: Dispatch,
  conversations: PmConversationData[],
|}>;

/**
 * A list describing all PM conversations.
 */
class PmConversationList extends PureComponent<Props> {
  handleUserNarrow = (email: string) => {
    this.props.dispatch(doNarrow(privateNarrow(email)));
  };

  handleGroupNarrow = (users: UserOrBot[]) => {
    const { dispatch, ownUser } = this.props;
    const emails = users
      .filter(u => u.user_id !== ownUser.user_id)
      .map(u => u.email)
      .sort();
    dispatch(doNarrow(groupNarrow(emails)));
  };

  render() {
    const { conversations, ownUser } = this.props;

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={20}
        data={conversations}
        keyExtractor={item => item.recipients}
        renderItem={({ item }) => {
          const users = normalizeUsersSansMe(item.users, ownUser.user_id);

          if (users.length === 1) {
            const user = users[0];

            if (!user) {
              return null;
            }

            return (
              <UserItem
                email={user.email}
                fullName={user.full_name}
                avatarUrl={user.avatar_url}
                unreadCount={item.unread}
                onPress={this.handleUserNarrow}
              />
            );
          }

          return (
            <GroupPmConversationItem
              users={users}
              unreadCount={item.unread}
              onPress={this.handleGroupNarrow}
            />
          );
        }}
      />
    );
  }
}

export default connect<SelectorProps, _, _>(state => ({
  ownUser: getOwnUser(state),
}))(PmConversationList);
