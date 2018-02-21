/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { User } from '../types';
import { Label } from '../common';
import UserItem from '../users/UserItem';
import ConversationGroup from './ConversationGroup';
import { NULL_USER } from '../nullObjects';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
  emptySlate: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
  },
});

type Props = {
  conversations: User[],
  presences: Object,
  usersByEmail: Object,
  onPress: (email: string) => void,
};

export default class ConversationList extends PureComponent<Props> {
  props: Props;

  render() {
    const { conversations, presences, usersByEmail, onPress } = this.props;

    if (!conversations.length) {
      return <Label style={styles.emptySlate} text="No recent conversations" />;
    }
    console.log(conversations);
    return (
      <FlatList
        style={styles.list}
        initialNumToRender={20}
        data={conversations}
        keyExtractor={item => item.recipients}
        renderItem={({ item }) => {
          if (item.recipients.indexOf(',') === -1) {
            let user = usersByEmail[item.recipients];

            if (!user) {
              user = {
                fullName: item.names,
              };
            }

            return (
              <UserItem
                email={user.email}
                fullName={user.fullName}
                avatarUrl={user.avatarUrl}
                presence={presences[user.email]}
                unreadCount={item.unread}
                onPress={onPress}
              />
            );
          }

          return (
            <ConversationGroup
              email={item.recipients}
              name={item.names}
              unreadCount={item.unread}
              usersByEmail={usersByEmail}
              onPress={onPress}
            />
          );
        }}
      />
    );
  }
}
