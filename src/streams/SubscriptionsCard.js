/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Dispatch, Narrow, Subscription, GlobalState } from '../types';
import { connectFlowFixMe } from '../react-redux';
import StreamList from './StreamList';
import { isStreamNarrow, streamNarrow } from '../utils/narrow';
import { getUnreadByStream } from '../selectors';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';
import { doNarrow } from '../actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {|
  dispatch: Dispatch,
  narrow: Narrow,
  subscriptions: Subscription[],
  unreadByStream: number[],
|};

class SubscriptionsCard extends PureComponent<Props> {
  handleNarrow = (streamName: string) => {
    this.props.dispatch(doNarrow(streamNarrow(streamName)));
  };

  render() {
    const { narrow, subscriptions, unreadByStream } = this.props;
    const selected = isStreamNarrow(narrow) && narrow[0].operand;

    return (
      <View style={styles.container}>
        <StreamList
          streams={subscriptions}
          selected={selected}
          unreadByStream={unreadByStream}
          onPress={this.handleNarrow}
        />
      </View>
    );
  }
}

export default connectFlowFixMe((state: GlobalState, props) => ({
  narrow: props.narrow || [],
  // Main screen no longer contains drawer,
  // so at any position we cannot show selected stream in the list
  // needs to be removed when we finalize navigation without drawer
  subscriptions: getSubscribedStreams(state),
  unreadByStream: getUnreadByStream(state),
}))(SubscriptionsCard);
