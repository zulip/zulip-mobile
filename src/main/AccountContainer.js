import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import AccountDetails from './AccountDetails';
import LogoutButton from '../userlist/LogoutButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    margin: 8,
  },
});

export default class AccountContainer extends Component {

  render() {
    return (
      <View style={styles.container} tabLabel="Account">
        <AccountDetails fullName="Full Name" email="email@example.com" />
        <LogoutButton />
      </View>
    );
  }
}
