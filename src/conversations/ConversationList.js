/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { Label } from '../common';
import ConversationUser from './ConversationUser';
import ConversationGroup from './ConversationGroup';
import type { User } from '../types';

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
  onPress: (email: string) => void,
};

export default class ConversationList extends PureComponent<Props> {
  props: Props;

  render() {
    const { conversations, onPress } = this.props;

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
          item.recipients.indexOf(',') === -1 ? ( // if single recipient
            <ConversationUser email={item.recipients} unreadCount={item.unread} onPress={onPress} />
          ) : (
            <ConversationGroup
              email={item.recipients}
              unreadCount={item.unread}
              onPress={onPress}
            />
          )
        }
      />
    );
  }
}
