/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
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
|}>;

export default function StreamListCard(props: Props): Node {
  const dispatch = useDispatch();
  const auth = useSelector(getAuth);
  const canCreateStreams = useSelector(getCanCreateStreams);
  const streams = useSelector(getStreams);
  const subscriptions = useSelector(getSubscriptions);

  const subsAndStreams = streams.map(x => ({
    ...x,
    subscribed: subscriptions.some(s => s.stream_id === x.stream_id),
  }));

  const handleSwitchChange = useCallback(
    (streamId: number, streamName: string, switchValue: boolean) => {
      if (switchValue) {
        api.subscriptionAdd(auth, [{ name: streamName }]);
      } else {
        api.subscriptionRemove(auth, [streamName]);
      }
    },
    [auth],
  );

  const handleNarrow = useCallback(
    (streamId: number, streamName: string) => {
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
