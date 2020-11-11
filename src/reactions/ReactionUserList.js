/* @flow strict-local */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import { connect } from '../react-redux';

import NavigationService from '../nav/NavigationService';
import type { Dispatch, UserOrBot } from '../types';
import UserItem from '../users/UserItem';
import { navigateToAccountDetails } from '../actions';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  reactedUserIds: $ReadOnlyArray<number>,
  allUsersById: Map<number, UserOrBot>,
|}>;

/**
 * Component showing who made a given reaction on a given message.
 *
 * Used within `MessageReactionList`.
 */
class ReactionUserList extends PureComponent<Props> {
  handlePress = (user: UserOrBot) => {
    NavigationService.dispatch(navigateToAccountDetails(user.user_id));
  };

  render() {
    const { reactedUserIds, allUsersById } = this.props;

    return (
      <FlatList
        data={reactedUserIds}
        keyExtractor={userId => `${userId}`}
        renderItem={({ item }) => {
          const user = allUsersById.get(item);
          if (!user) {
            return null;
          }
          return <UserItem key={user.user_id} user={user} onPress={this.handlePress} />;
        }}
      />
    );
  }
}

export default connect<{||}, _, _>()(ReactionUserList);
