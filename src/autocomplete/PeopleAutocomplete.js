import React, { Component } from 'react';
import { connect } from 'react-redux';


import { getAuth } from '../account/accountSelectors';
import { Popup } from '../common';
import UserItem from '../userlist/UserItem';
import { sortUserList, filterUsersStartingWith } from '../userlist/userListSelectors';


class PeopleAutocomplete extends Component {

  props: {
    filter: string;
    onAutocomplete: (name: string) => {},
  };

  render() {
    const { filter, ownEmail, users, onAutocomplete } = this.props;
    const people = sortUserList(filterUsersStartingWith(users, filter, ownEmail))
      .slice(1, 5)
      .toJS();

    if (people.length === 0) return null;

    return (
      <Popup>
        {people.map(x =>
          <UserItem
            key={x.email}
            fullName={x.fullName}
            avatarUrl={x.avatarUrl}
            onPress={() => onAutocomplete(x.fullName)}
          />
        )}
      </Popup>
    );
  }
}

const mapStateToProps = (state) => ({
  ownEmail: getAuth(state).get('email'),
  users: state.userlist,
});

export default connect(mapStateToProps)(PeopleAutocomplete);
