import React from 'react';
import moment from 'moment';

import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { renderHtml } from './renderHtml';
import { Avatar } from '../common';

const styles = StyleSheet.create({
  message: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 8,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  time: {
    color: '#999',
    fontSize: 15,
  },
});

export default class MessageView extends React.PureComponent {

  state = {
    message: null,
  };

  constructor(props) {
    super(props);
    this.renderMessage();
  }

  async renderMessage() {
    const message = await renderHtml(this.props.message, this.props.context);
    this.setState({ message });
  }

  render() {
    const { context, avatarUrl, timestamp, from } = this.props;

    return (
      <View style={styles.message}>
        <Avatar avatarUrl={context.rewriteLink(avatarUrl).uri} name={from} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.userName}>
              {from}
            </Text>
            <Text style={styles.time}>
              {moment(timestamp * 1000).format('LT')}
            </Text>
          </View>
          {this.state.message}
        </View>
      </View>
    );
  }
}
