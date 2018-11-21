/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Account, GlobalState, Narrow, Stream } from '../types';
import { ZulipButton } from '../common';
import { markAllAsRead, markStreamAsRead, markTopicAsRead } from '../api';
import { getActiveAccount, getStreams } from '../selectors';
import { isHomeNarrow, isStreamNarrow, isTopicNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    height: 32,
    paddingLeft: 12,
    paddingRight: 12,
  },
});

type Props = {
  account: Account,
  narrow: Narrow,
  streams: Stream[],
};

class MarkUnreadButton extends PureComponent<Props> {
  props: Props;

  handleMarkAllAsRead = () => {
    const { account } = this.props;
    markAllAsRead(account);
  };

  handleMarkStreamAsRead = () => {
    const { account, narrow, streams } = this.props;
    const stream = streams.find(s => s.name === narrow[0].operand);
    if (stream) {
      markStreamAsRead(account, stream.stream_id);
    }
  };

  handleMarkTopicAsRead = () => {
    const { account, narrow, streams } = this.props;
    const stream = streams.find(s => s.name === narrow[0].operand);
    if (stream) {
      markTopicAsRead(account, stream.stream_id, narrow[1].operand);
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

export default connect((state: GlobalState) => ({
  account: getActiveAccount(state),
  streams: getStreams(state),
}))(MarkUnreadButton);
