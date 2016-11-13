import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../common';

const styles = StyleSheet.create({
  avatarWrapper: {
    alignItems: 'center',
  },
  info: {
    textAlign: 'center',
  },
});

export default class AccountDetails extends Component {

  render() {
    const { fullName, email } = this.props;

    return (
      <View>
        <View style={styles.avatarWrapper}>
          <Avatar name={fullName} size={64} />
        </View>
        <Text style={styles.info}>{fullName}</Text>
        <Text style={styles.info}>{email}</Text>
      </View>
    );
  }
}
