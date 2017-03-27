import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../common';

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    padding: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginLeft: 8,
  },
  avatar: {
    backgroundColor: '#ddd',
    borderRadius: 32 / 8,
    width: 32,
    height: 32,
  },
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    width: 120,
    backgroundColor: '#ddd',
  },
  timestamp: {
    width: 60,
  },
  block: {
    backgroundColor: '#eee',
    borderRadius: 10,
    height: 8,
    marginBottom: 10,
  },
});

export default class MessageTyping extends React.PureComponent {
  props: {
    avatarUrl: string,
    fromName: string,
    fromEmail: string,
  };

  handleAvatarPress = () => this.props.pushRoute('account-details', this.props.email);

  render() {
    const { avatarUrl, fullName } = this.props;

    return (
      <View style={styles.message}>
        <Avatar
          avatarUrl={avatarUrl}
          name={fullName}
          onPress={this.handleAvatarPress}
        />
        <View style={styles.content}>
          <Text>... is typing</Text>
        </View>
      </View>
    );
  }
}
