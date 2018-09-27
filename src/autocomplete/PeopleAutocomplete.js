/* @flow */
import { connect } from 'react-redux';

import React, { Component } from 'react';
import { SectionList } from 'react-native';

import type { User, UserGroup, GlobalState } from '../types';
import { getOwnEmail, getSortedUsers, getUserGroups } from '../selectors';
import {
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
} from '../users/userHelpers';
import { Popup } from '../common';
import UserItem from '../users/UserItem';
import UserGroupItem from '../user-groups/UserGroupItem';

type Props = {
  filter: string,
  onAutocomplete: (name: string) => void,
  ownEmail: string,
  users: User[],
  userGroups: UserGroup[],
};

class PeopleAutocomplete extends Component<Props> {
  props: Props;

  shouldComponentUpdate(nextProps: Props) {
    // if filter string becomes empty then do not re-render
    // persists previous render, so that it can have some height and scale down animation is visible
    return nextProps.filter.length > 0;
  }

  render() {
    const { filter, ownEmail, users, userGroups, onAutocomplete } = this.props;
    if (filter.length === 0) {
      return null;
    }

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
            onPress={() => onAutocomplete(`*${item.name}*`)}
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
            onPress={() => onAutocomplete(`**${item.full_name}**`)}
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

export default connect((state: GlobalState) => ({
  ownEmail: getOwnEmail(state),
  users: getSortedUsers(state),
  userGroups: getUserGroups(state),
}))(PeopleAutocomplete);
