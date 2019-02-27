/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { Dispatch, PmConversationData, User, RealmBot } from '../types';
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
  usersByEmail: Map<string, User | RealmBot>,
|};

/**
 * A list describing all PM conversations.
 * */
export default class PmConversationList extends PureComponent<Props> {
  handleUserNarrow = (params: { email: string }) => {
    this.props.dispatch(doNarrow(privateNarrow(params.email)));
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

            // $FlowFixMe: sort out RealmBot
            const avatarUrl: string | null = user.avatar_url;
            return (
              <UserItem
                email={user.email}
                fullName={user.full_name}
                avatarUrl={avatarUrl}
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
