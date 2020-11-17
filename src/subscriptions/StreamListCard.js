/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { NavigationTabProp, NavigationStateRoute } from 'react-navigation-tabs';

import * as NavigationService from '../nav/NavigationService';
import type { Auth, Dispatch, Stream, Subscription } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { ZulipButton, LoadingBanner } from '../common';
import * as api from '../api';
import { delay } from '../utils/async';
import { streamNarrow } from '../utils/narrow';
import StreamList from '../streams/StreamList';
import { getAuth, getCanCreateStreams, getStreams, getSubscriptions } from '../selectors';
import { doNarrow, navigateToCreateStream } from '../actions';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
  },
  button: {
    margin: 16,
  },
});

type Props = $ReadOnly<{|
  // Since we've put this screen in a tab-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the tab-nav shape.
  navigation: NavigationTabProp<NavigationStateRoute>,

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
    const { canCreateStreams, streams, subscriptions } = this.props;
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
                NavigationService.dispatch(navigateToCreateStream());
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
