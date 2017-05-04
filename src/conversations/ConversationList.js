import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';

import ConversationUser from './ConversationUser';
import ConversationGroup from './ConversationGroup';

const styles = StyleSheet.create({
  container: {
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
  }
});

export default class ConversationList extends React.PureComponent {

  props: {
    conversations: string[],
    realm: string,
    users: any[],
    onNarrow: (email: string) => void,
  }

  render() {
    const { conversations } = this.props;

    if (!conversations.length) {
      return (
        <Text style={styles.emptySlate}>
          No Recent Conversations
        </Text>
      );
    }

    return (
      <FlatList
        enableEmptySections
        style={styles.container}
        data={conversations}
        keyExtractor={item => item.recipients}
        renderItem={({ item }) => (
          item.recipients.indexOf(',') === -1 ? // if single recipient
            <ConversationUser
              email={item.recipients}
              unreadCount={item.unread}
              {...this.props}
            /> :
            <ConversationGroup
              email={item.recipients}
              unreadCount={item.unread}
              {...this.props}
            />
        )}
      />
    );
  }
}
