import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import ZulipMessageTextView from '../message/ZulipMessageTextView';

const DEFAULT_PADDING = 8;

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: DEFAULT_PADDING,
  },
  messageContent: {
    flex: 1,
    flexDirection: 'column',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageUser: {
    fontWeight: 'bold',
  },
  messageTime: {
    color: '#999',
    fontSize: 12,
  },
  messageThumbnail: {
    width: 34,
    height: 34,
    marginRight: DEFAULT_PADDING * 2,
    borderRadius: 2,
  },
});

const ZulipMessageView = (props) => (
  <View style={styles.message}>
    <Image
      style={styles.messageThumbnail}
      source={{ uri: props.avatar_url }}
    />
    <View style={styles.messageContent}>
      <View style={styles.messageHeader}>
        <Text style={styles.messageUser}>
          {props.from}
        </Text>
        <Text style={styles.messageTime}>
          {moment(props.timestamp * 1000).format('LT')}
        </Text>
      </View>
      <ZulipMessageTextView
        style={styles.message}
        message={props.message}
      />
    </View>
  </View>
);

export default ZulipMessageView;
