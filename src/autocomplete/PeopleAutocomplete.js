/* @flow */
import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { connect } from 'react-redux';

import { UserType, GlobalState } from '../types';
import { getAuth } from '../account/accountSelectors';
import { Popup } from '../common';
import UserItem from '../users/UserItem';
import { alphabeticallySort, getAutocompleteSuggestion } from '../users/usersSelectors';

class PeopleAutocomplete extends Component {

  props: {
    filter: string,
    onAutocomplete: (name: string) => void,
    ownEmail: string,
    users: UserType[],
  };

  render() {
    const { filter, ownEmail, users, onAutocomplete } = this.props;
    const people: UserType[] = getAutocompleteSuggestion(users, filter, ownEmail);

    if (people.length === 0) return null;

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={10}
          data={people}
          keyExtractor={item => item.email}
          renderItem={({ item }) => (
            <UserItem
              key={item.email}
              fullName={item.fullName}
              avatarUrl={item.avatarUrl}
              email={item.email}
              showEmail
              onPress={() => onAutocomplete(item.fullName)}
            />
          )}
        />
      </Popup>
    );
  }
}

export default connect((state: GlobalState) => ({
  ownEmail: getAuth(state).email,
  users: alphabeticallySort(state.users),
}))(PeopleAutocomplete);
