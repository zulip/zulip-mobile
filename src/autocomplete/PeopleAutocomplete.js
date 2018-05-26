/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import type { User, GlobalState } from '../types';
import connectWithActions from '../connectWithActions';
import { getOwnEmail, getSortedUsers } from '../selectors';
import { getAutocompleteSuggestion } from '../users/userHelpers';
import { Popup } from '../common';
import UserItem from '../users/UserItem';

type Props = {
  filter: string,
  onAutocomplete: (name: string) => void,
  ownEmail: string,
  users: User[],
};

class PeopleAutocomplete extends PureComponent<Props> {
  props: Props;

  render() {
    const { filter, ownEmail, users, onAutocomplete } = this.props;
    const people: User[] = getAutocompleteSuggestion(users, filter, ownEmail);

    if (people.length === 0) {
      return null;
    }

    return (
      <Popup>
        <FlatList
          keyboardShouldPersistTaps="always"
          initialNumToRender={10}
          data={people}
          keyExtractor={item => item.email}
          renderItem={({ item }) => (
            <UserItem
              fullName={item.full_name}
              avatarUrl={item.avatar_url}
              email={item.email}
              showEmail
              onPress={() => onAutocomplete(item.full_name)}
            />
          )}
        />
      </Popup>
    );
  }
}

export default connectWithActions((state: GlobalState) => ({
  ownEmail: getOwnEmail(state),
  users: getSortedUsers(state),
}))(PeopleAutocomplete);
