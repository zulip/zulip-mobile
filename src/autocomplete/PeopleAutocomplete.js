/* @flow */
import React, { Component } from 'react';
import { connect } from 'react-redux';


import { getAuth } from '../account/accountSelectors';
import { Popup } from '../common';
import UserItem from '../users/UserItem';
import { sortUserList, filterUsersStartingWith } from '../users/usersSelectors';


class PeopleAutocomplete extends Component {

  props: {
    filter: string;
    onAutocomplete: (name: string) => {},
    ownEmail: string,
    users: Object[],
  };

  render() {
    const { filter, ownEmail, users, onAutocomplete } = this.props;
    const people = sortUserList(filterUsersStartingWith(users, filter, ownEmail))
      .slice(1, 5);

    if (people.length === 0) return null;

    return (
      <Popup>
        {people.map(x => (
          <UserItem
            key={x.email}
            fullName={x.fullName}
            avatarUrl={x.avatarUrl}
            onPress={() => onAutocomplete(x.fullName)}
          />
        ))}
      </Popup>
    );
  }
}

const mapStateToProps = (state) => ({
  ownEmail: getAuth(state).email,
  users: state.users,
});

export default connect(mapStateToProps)(PeopleAutocomplete);
