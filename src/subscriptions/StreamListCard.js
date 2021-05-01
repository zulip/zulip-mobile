/* @flow strict-local */

import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { FAB } from 'react-native-paper';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import type { Auth, Dispatch, Stream, Subscription } from '../types';
import { BRAND_COLOR, createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { LoadingBanner } from '../common';
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
    position: 'absolute',
    backgroundColor: BRAND_COLOR,
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

type Props = $ReadOnly<{|
  navigation: StreamTabsNavigationProp<'allStreams'>,
  route: RouteProp<'allStreams', void>,

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
        <StreamList
          streams={subsAndStreams}
          showSwitch
          showDescriptions
          onSwitch={this.handleSwitchChange}
          onPress={this.handleNarrow}
        />
        {canCreateStreams && (
          <FAB
            style={styles.button}
            icon="plus"
            accessibilityLabel="Create new stream"
            onPress={() =>
              delay(() => {
                NavigationService.dispatch(navigateToCreateStream());
              })
            }
          />
        )}
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
