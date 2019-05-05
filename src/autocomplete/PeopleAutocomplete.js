/* @flow strict-local */

import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { User, UserGroup, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getOwnEmail, getSortedUsers, getUserGroups } from '../selectors';
import {
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
} from '../users/userHelpers';
import { Popup } from '../common';
import UserItem from '../users/UserItem';
import UserGroupItem from '../user-groups/UserGroupItem';

type Props = {|
  dispatch: Dispatch,
  filter: string,
  onAutocomplete: (name: string) => void,
  ownEmail: string,
  users: User[],
  userGroups: UserGroup[],
|};

class PeopleAutocomplete extends PureComponent<Props> {
  handleUserGroupItemAutocomplete = (name: string): void => {
    this.props.onAutocomplete(`*${name}*`);
  };

  handleUserItemAutocomplete = (email: string): void => {
    const { users, onAutocomplete } = this.props;
    const user = users.find(x => x.email === email);
    if (user) {
      onAutocomplete(`**${user.full_name}**`);
    }
  };

  render() {
    const { filter, ownEmail, users, userGroups } = this.props;
    const filteredUserGroups = getAutocompleteUserGroupSuggestions(userGroups, filter);
    const filteredUsers: User[] = getAutocompleteSuggestion(users, filter, ownEmail);

    if (filteredUserGroups.length + filteredUsers.length === 0) {
      return null;
    }

    const sections = [
      {
        data: filteredUserGroups,
        renderItem: ({ item }) => (
          <UserGroupItem
            key={item.name}
            name={item.name}
            description={item.description}
            onPress={this.handleUserGroupItemAutocomplete}
          />
        ),
      },
      {
        data: filteredUsers,
        renderItem: ({ item }) => (
          <UserItem
            key={item.user_id}
            fullName={item.full_name}
            avatarUrl={item.avatar_url}
            email={item.email}
            showEmail
            onPress={this.handleUserItemAutocomplete}
          />
        ),
      },
    ];

    return (
      <Popup>
        <SectionList
          keyboardShouldPersistTaps="always"
          initialNumToRender={10}
          sections={sections}
        />
      </Popup>
    );
  }
}

export default connect(state => ({
  ownEmail: getOwnEmail(state),
  users: getSortedUsers(state),
  userGroups: getUserGroups(state),
}))(PeopleAutocomplete);
