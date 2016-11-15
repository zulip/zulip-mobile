import React, { Component } from 'react';

import { Popup } from '../common';
import UserList from '../userlist/UserList';

type Props = {
  ownEmail: string,
  users: any[],
  presence: Object,
};

export default class PeopleAutocomplete extends Component {

  handleSelect = (index: number) => {
  }

  render() {
    const { ownEmail, users, presence, filter } = this.props;

    return (
      <Popup>
        <UserList
          ownEmail={ownEmail}
          users={users}
          presence={presence}
          filter={filter}
          onNarrow={this.handleUserNarrow}
        />
      </Popup>
    );
  }
}
