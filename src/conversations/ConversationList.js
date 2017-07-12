/* @flow */
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { User } from '../types';
import { Label } from '../common';
import ConversationUser from './ConversationUser';
import ConversationGroup from './ConversationGroup';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
  groupHeader: {
    fontWeight: 'bold',
    paddingLeft: 8,
    fontSize: 18,
  },
  emptySlate: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
  },
});

export default class ConversationList extends React.PureComponent {
  props: {
    realm: string,
    users: User[],
    conversations: string[],
    onNarrow: (arg: string) => void,
  };

  render() {
    const { conversations, users, realm, onNarrow } = this.props;

    if (!conversations.length) {
      return <Label style={styles.emptySlate} text="No recent conversations" />;
    }

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={20}
        data={conversations}
        keyExtractor={item => item.recipients}
        renderItem={({ item }) =>
          item.recipients.indexOf(',') === -1 // if single recipient
            ? <ConversationUser
                email={item.recipients}
                unreadCount={item.unread}
                users={users}
                realm={realm}
                onNarrow={onNarrow}
              />
            : <ConversationGroup
                email={item.recipients}
                unreadCount={item.unread}
                users={users}
                realm={realm}
                onNarrow={onNarrow}
              />}
      />
    );
  }
}
