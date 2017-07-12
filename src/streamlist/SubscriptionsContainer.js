/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Narrow, GlobalState, SubscriptionsState } from '../types';
import StreamList from './StreamList';
import { isStreamNarrow, streamNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

class SubscriptionsContainer extends React.Component {
  props: {
    narrow: Narrow,
    subscriptions: SubscriptionsState,
    onNarrow: (email: string) => void,
  };

  handleNarrow = (streamName: string) => this.props.onNarrow(streamNarrow(streamName));

  render() {
    const { narrow, subscriptions } = this.props;
    const selected = isStreamNarrow(narrow) && narrow[0].operand;

    return (
      <View tabLabel="Streams" style={styles.container}>
        <StreamList streams={subscriptions} selected={selected} onNarrow={this.handleNarrow} />
      </View>
    );
  }
}

export default connect((state: GlobalState) => ({
  narrow: state.chat.narrow,
  subscriptions: state.subscriptions,
}))(SubscriptionsContainer);
