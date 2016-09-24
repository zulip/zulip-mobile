import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import UsersDrawer from './UsersDrawer';

const serverPresenceToStatus = (status: string, timestamp: number) =>
  timestamp - Date.now() < 1000 ? status : 'offline';

export default class ZulipDrawer extends Component {

  props: {
    users: string[],
  };

  render() {
    const users = [
      { status: 'active', name: 'Boris' },
      { status: 'idle', name: 'Tim' },
      { status: 'offline', name: 'Bob' },
    ];

    return (
      <UsersDrawer users={users} />
    )
  }
}
