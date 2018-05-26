/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { Actions, PresenceState } from '../types';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import UserItem from '../users/UserItem';
import ConversationGroup from './ConversationGroup';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
  actions: Actions,
  conversations: Object[],
  presences: PresenceState,
  usersByEmail: Object,
};

export default class ConversationList extends PureComponent<Props> {
  props: Props;

  handleUserNarrow = (email: string) => this.props.actions.doNarrow(privateNarrow(email));

  handleGroupNarrow = (email: string) => this.props.actions.doNarrow(groupNarrow(email.split(',')));

  render() {
    const { conversations, presences, usersByEmail } = this.props;

    return (
      <FlatList
        style={styles.list}
        initialNumToRender={20}
        data={conversations}
        keyExtractor={item => item.recipients}
        renderItem={({ item }) => {
          if (item.recipients.indexOf(',') === -1) {
            const user = usersByEmail[item.recipients];

            if (!user) {
              return null;
            }

            return (
              <UserItem
                email={user.email}
                fullName={user.full_name}
                avatarUrl={user.avatar_url}
                presence={presences[user.email]}
                unreadCount={item.unread}
                onPress={this.handleUserNarrow}
              />
            );
          }

          return (
            <ConversationGroup
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
