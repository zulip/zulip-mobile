import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import LogoutButton from '../userlist/LogoutButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
});

export default class AccountContainer extends Component {

  render() {
    return (
      <View style={styles.container}>
        <LogoutButton />
      </View>
    );
  }
}
