/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';

import type { User, GlobalState } from '../types';
import {
  getOwnEmail,
  sortAlphabetically,
  getAutocompleteSuggestion,
  getAllActiveUsers,
} from '../selectors';
import { Popup } from '../common';
import UserItem from '../users/UserItem';

class PeopleAutocomplete extends PureComponent {
  props: {
    filter: string,
    onAutocomplete: (name: string) => void,
    ownEmail: string,
    users: User[],
  };

  render() {
    const { filter, ownEmail, users, onAutocomplete } = this.props;
    const people: User[] = getAutocompleteSuggestion(users, filter, ownEmail);

    if (people.length === 0) return null;

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={10}
          data={people}
          keyExtractor={item => item.email}
          renderItem={({ item }) =>
            <UserItem
              fullName={item.fullName}
              avatarUrl={item.avatarUrl}
              email={item.email}
              showEmail
              onPress={() => onAutocomplete(item.fullName)}
            />}
        />
      </Popup>
    );
  }
}

export default connect((state: GlobalState) => ({
  ownEmail: getOwnEmail(state),
  users: sortAlphabetically(getAllActiveUsers(state)),
}))(PeopleAutocomplete);
