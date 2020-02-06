/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { Dispatch, PmConversationData, UserOrBot } from '../types';
import { createStyleSheet } from '../styles';
import { privateNarrow, groupNarrow } from '../utils/narrow';
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
  usersByEmail: Map<string, UserOrBot>,
|}>;

/**
 * A list describing all PM conversations.
 * */
export default class PmConversationList extends PureComponent<Props> {
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
              <UserItem user={user} unreadCount={item.unread} onPress={this.handleUserNarrow} />
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
