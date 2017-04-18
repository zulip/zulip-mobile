/* @flow */
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, ZulipButton } from '../common';
import { privateNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  avatarWrapper: {
    alignItems: 'center',
  },
  info: {
    textAlign: 'center',
    fontSize: 18,
  },
  details: {
    padding: 8,
  },
  padding: {
    padding: 8,
  },
});

export default class AccountDetails extends Component {

  handleChatPress = () => {
    const { email, doNarrow, navigateBack } = this.props;
    doNarrow(privateNarrow(email));
    navigateBack();
  };

  render() {
    const { avatarUrl, fullName, email, status, auth } = this.props;

    return (
      <View style={styles.padding}>
        <View style={styles.avatarWrapper}>
          <Avatar
            avatarUrl={avatarUrl}
            name={fullName}
            size={100}
            status={status}
            realm={auth.realm}
          />
        </View>
        <View style={styles.details}>
          <Text style={styles.info}>{fullName}</Text>
          <Text style={styles.info}>{email}</Text>
        </View>
        <ZulipButton
          style={styles.logoutButton}
          secondary
          text="Chat"
          onPress={this.handleChatPress}
        />
      </View>
    );
  }
}
