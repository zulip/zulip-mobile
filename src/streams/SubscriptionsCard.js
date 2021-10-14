/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import StreamList from './StreamList';
import { LoadingBanner } from '../common';
import { streamNarrow } from '../utils/narrow';
import { getUnreadByStream } from '../selectors';
import { getSubscribedStreams } from '../subscriptions/subscriptionSelectors';
import { doNarrow } from '../actions';

const styles = createStyleSheet({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = $ReadOnly<{|
  navigation: StreamTabsNavigationProp<'subscribed'>,
  route: RouteProp<'subscribed', void>,
|}>;

export default function SubscriptionsCard(props: Props): Node {
  const dispatch = useDispatch();
  const subscriptions = useSelector(getSubscribedStreams);
  const unreadByStream = useSelector(getUnreadByStream);

  const handleNarrow = useCallback(
    (streamId: number, streamName: string) => {
      dispatch(doNarrow(streamNarrow(streamName)));
    },
    [dispatch],
  );

  return (
    <View style={styles.container}>
      <LoadingBanner />
      <StreamList streams={subscriptions} unreadByStream={unreadByStream} onPress={handleNarrow} />
    </View>
  );
}
