/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Narrow, SubscriptionsState } from '../types';
import StreamList from './StreamList';
import { isStreamNarrow, streamNarrow } from '../utils/narrow';
import { Auth } from '../types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
  auth: Auth,
  narrow: Narrow,
  subscriptions: SubscriptionsState,
  unreadByStream: number[],
  doNarrowCloseDrawer: (narrow: Narrow) => void,
};

export default class SubscriptionsCard extends PureComponent<Props> {
  props: Props;

  handleNarrow = (streamName: string) => {
    this.props.doNarrowCloseDrawer(streamNarrow(streamName));
  };

  render() {
    const { narrow, subscriptions, unreadByStream, auth, doNarrowCloseDrawer } = this.props;
    const selected = isStreamNarrow(narrow) && narrow[0].operand;

    return (
      <View style={styles.container}>
        <StreamList
          auth={auth}
          streams={subscriptions}
          selected={selected}
          unreadByStream={unreadByStream}
          onPress={this.handleNarrow}
          doNarrowCloseDrawer={doNarrowCloseDrawer}
        />
      </View>
    );
  }
}
