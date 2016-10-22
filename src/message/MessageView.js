import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { renderHtml } from './renderHtml';
import { BORDER_COLOR } from '../common/styles';
import { Avatar } from '../common';

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
  constructor(props) {
    super(props);
    this.renderMessage();
    this.state = {
      message: null,
    };
  }

  async renderMessage() {
    const message = await renderHtml(this.props.message, this.props.context);
    this.setState({ message });
  }

  render() {
    const { context, avatarUrl, timestamp, from } = this.props;

    return (
      <View style={styles.message}>
        <Avatar avatarUrl={context.rewriteLink(avatarUrl).uri} />
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageUser}>
              {from}
            </Text>
            <Text style={styles.messageTime}>
              {moment(timestamp * 1000).format('LT')}
            </Text>
          </View>
          {this.state.message}
        </View>
      </View>
    );
  }
}
