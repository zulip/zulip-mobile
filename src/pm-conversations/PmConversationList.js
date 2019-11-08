/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { Dispatch, PmConversationData, UserOrBot } from '../types';
import { connect } from '../react-redux';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import UserItem from '../users/UserItem';
import GroupPmConversationItem from './GroupPmConversationItem';
import { doNarrow } from '../actions';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {|
  dispatch: Dispatch,
  conversations: PmConversationData[],
  usersByEmail: Map<string, UserOrBot>,
|};

/**
 * A list describing all PM conversations.
 * */
class PmConversationList extends PureComponent<Props> {
  handleUserNarrow = (email: string) => {
    this.props.dispatch(doNarrow(privateNarrow(email)));
  };

  handleGroupNarrow = (email: string) => {
    this.props.dispatch(doNarrow(groupNarrow(email.split(','))));
  };

  render() {
    const { conversations, usersByEmail } = this.props;

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={20}
        data={conversations}
        keyExtractor={item => item.recipients}
        renderItem={({ item }) => {
          if (item.recipients.indexOf(',') === -1) {
            const user = usersByEmail.get(item.recipients);

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
              email={item.recipients}
              unreadCount={item.unread}
              usersByEmail={usersByEmail}
              onPress={this.handleGroupNarrow}
            />
          );
        }}
      />
    );
  }
}

export default connect()(PmConversationList);
