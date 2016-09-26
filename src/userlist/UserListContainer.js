import React, { Component } from 'react';
import UsersDrawer from './UsersDrawer';

const serverPresenceToStatus = (status: string, timestamp: number) =>
  (timestamp - Date.now() < 1000 ? status : 'offline');

export default class UserListContainer extends Component {

  props: {
    users: string[],
  };

  render() {
    const users = [
      { status: 'active', name: 'Boris' },
      { status: 'idle', name: 'Tim' },
      { status: 'offline', name: 'Neraj' },
    ];

    return (
      <UsersDrawer users={users} />
    );
  }
}
