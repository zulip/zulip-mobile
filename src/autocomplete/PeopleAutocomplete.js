/* @flow strict-local */

import React, { PureComponent } from 'react';
import { SectionList } from 'react-native';

import type { User, UserGroup, UserOrBot, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getOwnEmail, getSortedUsers, getUserGroups } from '../selectors';
import {
  getAutocompleteSuggestion,
  getAutocompleteUserGroupSuggestions,
} from '../users/userHelpers';
import { Popup } from '../common';
import UserItem from '../users/UserItem';
import UserGroupItem from '../user-groups/UserGroupItem';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  filter: string,
  onAutocomplete: (name: string) => void,
  ownEmail: string,
  users: User[],
  userGroups: UserGroup[],
|}>;

class PeopleAutocomplete extends PureComponent<Props> {
  handleUserGroupItemAutocomplete = (name: string): void => {
    this.props.onAutocomplete(`*${name}*`);
  };

  handleUserItemAutocomplete = (user: UserOrBot): void => {
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
            user={item}
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
