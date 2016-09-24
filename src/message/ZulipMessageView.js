import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import PureRenderMixin from 'react-addons-pure-render-mixin';

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

class ZulipMessageView extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

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
};

export default ZulipMessageView;
