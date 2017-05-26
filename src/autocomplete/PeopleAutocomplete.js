/* @flow */
import React, { Component } from 'react';
import { ListView } from 'react-native';
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
    const people = sortUserList(filterUsersStartingWith(users, filter, ownEmail));

    if (people.length === 0) return null;

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    const dataSource = ds.cloneWithRows(people);

    return (
      <Popup>
        <ListView
          dataSource={dataSource}
          renderRow={x => (
            <UserItem
              key={x.email}
              fullName={x.fullName}
              avatarUrl={x.avatarUrl}
              onPress={() => onAutocomplete(x.fullName)}
            />
          )}
        />
      </Popup>
    );
  }
}

const mapStateToProps = (state) => ({
  ownEmail: getAuth(state).email,
  users: state.users,
});

export default connect(mapStateToProps)(PeopleAutocomplete);
