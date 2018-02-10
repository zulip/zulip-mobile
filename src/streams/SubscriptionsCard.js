/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Actions, Narrow, SubscriptionsState } from '../types';
import StreamList from './StreamList';
import { isStreamNarrow, streamNarrow } from '../utils/narrow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
  actions: Actions,
  narrow: Narrow,
  subscriptions: SubscriptionsState,
  unreadByStream: number[],
};

export default class SubscriptionsCard extends PureComponent<Props> {
  props: Props;

  handleNarrow = (streamName: string) => {
    this.props.actions.doNarrow(streamNarrow(streamName));
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
