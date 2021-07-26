/* @flow strict-local */

import React, { useCallback } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
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
  navigation: StreamTabsNavigationProp<'allStreams'>,
  route: RouteProp<'allStreams', void>,

  dispatch: Dispatch,
  auth: Auth,
  canCreateStreams: boolean,
  streams: $ReadOnlyArray<Stream>,
  subscriptions: $ReadOnlyArray<Subscription>,
|}>;

function StreamListCard(props: Props) {
  const { dispatch, auth, canCreateStreams, streams, subscriptions } = props;
  const subsAndStreams = streams.map(x => ({
    ...x,
    subscribed: subscriptions.some(s => s.stream_id === x.stream_id),
  }));

  const handleSwitchChange = useCallback(
    (streamName: string, switchValue: boolean) => {
      if (switchValue) {
        api.subscriptionAdd(auth, [{ name: streamName }]);
      } else {
        api.subscriptionRemove(auth, [streamName]);
      }
    },
    [auth],
  );

  const handleNarrow = useCallback(
    (streamName: string) => {
      dispatch(doNarrow(streamNarrow(streamName)));
    },
    [dispatch],
  );

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
        onSwitch={handleSwitchChange}
        onPress={handleNarrow}
      />
    </View>
  );
}

export default connect(state => ({
  auth: getAuth(state),
  canCreateStreams: getCanCreateStreams(state),
  streams: getStreams(state),
  subscriptions: getSubscriptions(state),
}))(StreamListCard);
