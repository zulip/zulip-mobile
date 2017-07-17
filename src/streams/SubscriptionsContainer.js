/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import type { Actions, Narrow, GlobalState, SubscriptionsState } from '../types';
import { getActiveNarrow, getUnreadByStream } from '../selectors';
import StreamList from './StreamList';
import { isStreamNarrow, streamNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

class SubscriptionsContainer extends PureComponent {
  props: {
    actions: Actions,
    narrow: Narrow,
    subscriptions: SubscriptionsState,
    unreadByStream: number[],
  };

  handleNarrow = (streamName: string) => this.props.actions.doNarrow(streamNarrow(streamName));

  render() {
    const { narrow, subscriptions, unreadByStream } = this.props;
    const selected = isStreamNarrow(narrow) && narrow[0].operand;

    return (
      <View tabLabel="Streams" style={styles.container}>
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

export default connect(
  (state: GlobalState) => ({
    narrow: getActiveNarrow(state),
    subscriptions: state.subscriptions,
    unreadByStream: getUnreadByStream(state),
  }),
  boundActions,
)(SubscriptionsContainer);
