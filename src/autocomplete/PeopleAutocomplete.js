/* @flow strict-local */

import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { MutedUsersState, User, UserId, UserGroup, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getMutedUsers, getSortedUsers, getUserGroups } from '../selectors';
import {
  type AutocompleteOption,
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
} from '../users/userHelpers';
import { Popup } from '../common';
import { UserItemRaw } from '../users/UserItem';
import UserGroupItem from '../user-groups/UserGroupItem';
import { getOwnUserId } from '../users/userSelectors';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  filter: string,
  onAutocomplete: (name: string) => void,
  mutedUsers: MutedUsersState,
  ownUserId: UserId,
  users: User[],
  userGroups: UserGroup[],
|}>;

class PeopleAutocomplete extends PureComponent<Props> {
  handleUserGroupItemAutocomplete = (name: string): void => {
    this.props.onAutocomplete(`*${name}*`);
  };

  handleUserItemAutocomplete = (user: AutocompleteOption): void => {
    const { users, onAutocomplete } = this.props;
    // If another user with the same full name is found, we send the
    // user ID as well, to ensure the mentioned user is uniquely identified.
    if (users.find(x => x.full_name === user.full_name && x.user_id !== user.user_id)) {
      // See the `get_mention_syntax` function in
      // `static/js/people.js` in the webapp.
      onAutocomplete(`**${user.full_name}|${user.user_id}**`);
      return;
    }
    onAutocomplete(`**${user.full_name}**`);
  };

  render() {
    const { filter, mutedUsers, ownUserId, users, userGroups } = this.props;
    const filteredUserGroups = getAutocompleteUserGroupSuggestions(userGroups, filter);
    const filteredUsers = getAutocompleteSuggestion(users, filter, ownUserId, mutedUsers);

    if (filteredUserGroups.length + filteredUsers.length === 0) {
      return null;
    }

    type Section<T> = {|
      +data: $ReadOnlyArray<T>,
      +renderItem: ({ item: T, ... }) => React$MixedElement,
    |};
    const sections = [
      ({
        data: filteredUserGroups,
        renderItem: ({ item }) => (
          <UserGroupItem
            key={item.name}
            name={item.name}
            description={item.description}
            onPress={this.handleUserGroupItemAutocomplete}
          />
        ),
      }: Section<UserGroup>),
      ({
        data: filteredUsers,
        renderItem: ({ item }) => (
          // "Raw" because some of our autocomplete suggestions are fake
          // synthetic "users" to represent @all and @everyone.
          // TODO display those in a UI that makes more sense for them,
          //   and drop the fake "users" and use the normal UserItem.
          <UserItemRaw
            key={item.user_id}
            user={item}
            showEmail
            onPress={this.handleUserItemAutocomplete}
          />
        ),
      }: Section<AutocompleteOption>),
    ];

    return (
      <Popup>
        {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
        {
          // $FlowFixMe[incompatible-variance]
          /* $FlowFixMe[prop-missing]
             SectionList type is confused; should take $ReadOnly
             objects. */
          <SectionList
            keyboardShouldPersistTaps="always"
            initialNumToRender={10}
            sections={sections}
          />
        }
      </Popup>
    );
  }
}

export default connect(state => ({
  mutedUsers: getMutedUsers(state),
  ownUserId: getOwnUserId(state),
  users: getSortedUsers(state),
  userGroups: getUserGroups(state),
}))(PeopleAutocomplete);
