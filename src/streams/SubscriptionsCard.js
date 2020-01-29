/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Dispatch, Subscription } from '../types';
import { connectFlowFixMe } from '../react-redux';
import StreamList from './StreamList';
import { streamNarrow } from '../utils/narrow';
import { getUnreadByStream } from '../selectors';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';
import { doNarrow } from '../actions';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type SelectorProps = $ReadOnly<{|
  subscriptions: Subscription[],
  unreadByStream: number[],
|}>;

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class SubscriptionsCard extends PureComponent<Props> {
  handleNarrow = (streamName: string) => {
    this.props.dispatch(doNarrow(streamNarrow(streamName)));
  };

  render() {
    const { subscriptions, unreadByStream } = this.props;

    return (
      <View style={styles.container}>
        <StreamList
          streams={subscriptions}
          unreadByStream={unreadByStream}
          onPress={this.handleNarrow}
        />
      </View>
    );
  }
}

export default connectFlowFixMe((state, props) => ({
  subscriptions: getSubscribedStreams(state),
  unreadByStream: getUnreadByStream(state),
}))(SubscriptionsCard);
