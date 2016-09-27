import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';

import ZulipMessageTextView from '../message/ZulipMessageTextView';

const DEFAULT_PADDING = 12;

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: DEFAULT_PADDING,
    overflow: 'hidden',
  },
  messageContent: {
    flex: 1,
    flexDirection: 'column',
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
  messageThumbnail: {
    width: 36,
    height: 36,
    marginRight: DEFAULT_PADDING,
    borderRadius: 2,
  },
});

class ZulipMessageView extends React.PureComponent {

  render() {
    return (
      <View style={styles.message}>
        <Image
          style={styles.messageThumbnail}
          source={{ uri: this.props.avatarUrl }}
        />
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageUser}>
              {this.props.from}
            </Text>
            <Text style={styles.messageTime}>
              {moment(this.props.timestamp * 1000).format('LT')}
            </Text>
          </View>
          <ZulipMessageTextView
            style={styles.message}
            message={this.props.message}
          />
        </View>
      </View>
    );
  }
}

export default ZulipMessageView;
