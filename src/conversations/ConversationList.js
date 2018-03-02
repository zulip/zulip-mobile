/* @flow */
import React, { PureComponent } from 'react';
import { View, FlatList } from 'react-native';

import type { Actions } from '../types';
import { privateNarrow, groupNarrow } from '../utils/narrow';
import UserItem from '../users/UserItem';
import ConversationGroup from './ConversationGroup';

type Props = {
  actions: Actions,
  conversations: Object[],
  presences: Object,
  usersByEmail: Object,
  listLabel?: Object,
  maxHeight?: number,
};

export default class ConversationList extends PureComponent<Props> {
  props: Props;

  handleUserNarrow = (email: string) => this.props.actions.doNarrow(privateNarrow(email));

  handleGroupNarrow = (email: string) => this.props.actions.doNarrow(groupNarrow(email.split(',')));

  render() {
    const { conversations, listLabel, maxHeight, presences, usersByEmail } = this.props;

    return (
      <View>
        {conversations.length > 0 && listLabel}
        <FlatList
          initialNumToRender={20}
          data={conversations}
          keyExtractor={item => item.recipients}
          maxHeight={maxHeight}
          renderItem={({ item }) => {
            if (item.recipients.indexOf(',') === -1) {
              const user = usersByEmail[item.recipients];

              if (!user) return null;

              return (
                <UserItem
                  email={user.email}
                  fullName={user.fullName}
                  avatarUrl={user.avatarUrl}
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
      </View>
    );
  }
}
