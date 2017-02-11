import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, ZulipButton, UserStatusIndicator } from '../common';
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
  status: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 18,
  }
});

export default class AccountDetails extends Component {

  handleChatPress = () => {
    const { auth, email, fetchMessages, popRoute } = this.props;
    fetchMessages(auth, Number.MAX_SAFE_INTEGER, 25, 0, privateNarrow(email));
    popRoute();
  };

  render() {
    const { avatarUrl, fullName, email, status } = this.props;

    return (
      <View>
        <View style={styles.avatarWrapper}>
          <Avatar avatarUrl={avatarUrl} name={fullName} size={100} />
        </View>
        <View style={styles.details}>
          <View style={styles.status}>
            <UserStatusIndicator status={status} />
            <Text style={styles.statusText}>
              {status && status[0].toUpperCase() + status.slice(1)}
            </Text>
          </View>
          <Text style={styles.info}>{fullName}</Text>
          <Text style={styles.info}>{email}</Text>
        </View>
        <ZulipButton
          customStyles={styles.logoutButton}
          secondary
          text="Chat"
          onPress={this.handleChatPress}
        />
      </View>
    );
  }
}
