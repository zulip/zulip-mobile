/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Auth, Dispatch, Stream, Subscription } from '../types';
import { connect } from '../react-redux';
import { ZulipButton, LoadingBanner } from '../common';
import * as api from '../api';
import { delay } from '../utils/async';
import { streamNarrow } from '../utils/narrow';
import StreamList from '../streams/StreamList';
import { getAuth, getCanCreateStreams, getStreams, getSubscriptions } from '../selectors';
import { doNarrow, navigateToCreateStream } from '../actions';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  button: {
    margin: 16,
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  auth: Auth,
  canCreateStreams: boolean,
  streams: Stream[],
  subscriptions: Subscription[],
|}>;

class StreamListCard extends PureComponent<Props> {
  handleSwitchChange = (streamName: string, switchValue: boolean) => {
    const { auth } = this.props;

    if (switchValue) {
      api.subscriptionAdd(auth, [{ name: streamName }]);
    } else {
      api.subscriptionRemove(auth, [streamName]);
    }
  };

  handleNarrow = (streamName: string) => {
    const { dispatch } = this.props;
    dispatch(doNarrow(streamNarrow(streamName)));
  };

  render() {
    const { dispatch, canCreateStreams, streams, subscriptions } = this.props;
    const subsAndStreams = streams.map(x => ({
      ...x,
      subscribed: subscriptions.some(s => s.stream_id === x.stream_id),
    }));

    return (
      <View style={styles.wrapper}>
        <LoadingBanner />
        {canCreateStreams && (
          <ZulipButton
            style={styles.button}
            secondary
            text="Create new stream"
            onPress={() =>
              delay(() => {
                dispatch(navigateToCreateStream());
              })
            }
          />
        )}
        <StreamList
          streams={subsAndStreams}
          showSwitch
          showDescriptions
          onSwitch={this.handleSwitchChange}
          onPress={this.handleNarrow}
        />
      </View>
    );
  }
}

export default connect(state => ({
  auth: getAuth(state),
  canCreateStreams: getCanCreateStreams(state),
  streams: getStreams(state),
  subscriptions: getSubscriptions(state),
}))(StreamListCard);
