import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import Avatar from '../common/Avatar';

import MessageTextView from '../message/MessageTextView';

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    overflow: 'hidden',
  },
  messageContent: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 8,
  },
  messageHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageUser: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  messageTime: {
    color: '#999',
    fontSize: 15,
  },
});

export default class MessageView extends React.PureComponent {

  render() {
    return (
      <View style={styles.message}>
        <Avatar avatarUrl={this.props.avatarUrl} />
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageUser}>
              {this.props.from}
            </Text>
            <Text style={styles.messageTime}>
              {moment(this.props.timestamp * 1000).format('LT')}
            </Text>
          </View>
          <MessageTextView
            style={styles.message}
            message={this.props.message}
          />
        </View>
      </View>
    );
  }
}
