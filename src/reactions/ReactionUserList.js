/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import * as NavigationService from '../nav/NavigationService';
import type { UserOrBot } from '../types';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  reactedUserIds: $ReadOnlyArray<number>,
|}>;

/**
 * Component showing who made a given reaction on a given message.
 *
 * Used within `MessageReactionList`.
 */
export default class ReactionUserList extends PureComponent<Props> {
  handlePress = (user: UserOrBot) => {
    NavigationService.dispatch(navigateToAccountDetails(user.user_id));
  };

  render() {
    const { reactedUserIds } = this.props;

    return (
      <FlatList
        data={reactedUserIds}
        keyExtractor={userId => `${userId}`}
        renderItem={({ item }) => <UserItem key={item} userId={item} onPress={this.handlePress} />}
      />
    );
  }
}
