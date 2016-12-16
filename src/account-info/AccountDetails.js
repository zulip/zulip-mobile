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
    const { avatarUrl, fullName, email } = this.props;

    return (
      <View>
        <View style={styles.avatarWrapper}>
          <Avatar avatarUrl={avatarUrl} name={fullName} size={100} />
        </View>
        <Text style={styles.info}>{fullName}</Text>
        <Text style={styles.info}>{email}</Text>
      </View>
    );
  }
}
