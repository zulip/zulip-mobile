/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Auth, Narrow, Stream } from '../types';
import { ZulipButton } from '../common';
import { markAllAsRead, markStreamAsRead, markTopicAsRead } from '../api';
import { getActiveNarrow, getAuth, getStreams } from '../selectors';
import { isHomeNarrow, isStreamNarrow, isTopicNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    height: 32,
    paddingLeft: 12,
    paddingRight: 12,
  },
});

class MarkUnreadButton extends PureComponent {
  props: {
    auth: Auth,
    narrow: Narrow,
    streams: Stream[],
  };

  handleMarkAllAsRead = () => {
    const { auth } = this.props;
    markAllAsRead(auth);
  };

  handleMarkStreamAsRead = () => {
    const { auth, narrow, streams } = this.props;
    const stream = streams.find(s => s.name === narrow[0].operand);
    if (stream) {
      markStreamAsRead(auth, stream.stream_id);
    }
  };

  handleMarkTopicAsRead = () => {
    const { auth, narrow, streams } = this.props;
    const stream = streams.find(s => s.name === narrow[0].operand);
    if (stream) {
      markTopicAsRead(auth, stream.stream_id, narrow[1].operand);
    }
  };

  render() {
    const { narrow } = this.props;

    if (isHomeNarrow(narrow)) {
      return (
        <ZulipButton
          style={styles.button}
          text="Mark all as read"
          onPress={this.handleMarkAllAsRead}
        />
      );
    }

    if (isStreamNarrow(narrow)) {
      return (
        <ZulipButton
          style={styles.button}
          text="Mark stream as read"
          onPress={this.handleMarkStreamAsRead}
        />
      );
    }

    if (isTopicNarrow(narrow)) {
      return (
        <ZulipButton
          style={styles.button}
          text="Mark topic as read"
          onPress={this.handleMarkTopicAsRead}
        />
      );
    }

    return null;
  }
}

export default connect(state => ({
  auth: getAuth(state),
  narrow: getActiveNarrow(state),
  streams: getStreams(state),
}))(MarkUnreadButton);
