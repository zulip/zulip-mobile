/* @flow strict-local */

import React, { useCallback } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
import type { Dispatch, Subscription } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
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

type SelectorProps = $ReadOnly<{|
  subscriptions: Subscription[],
  unreadByStream: $ReadOnly<{| [number]: number |}>,
|}>;

type Props = $ReadOnly<{|
  navigation: StreamTabsNavigationProp<'subscribed'>,
  route: RouteProp<'subscribed', void>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

function SubscriptionsCard(props: Props) {
  const { dispatch, subscriptions, unreadByStream } = props;

  const handleNarrow = useCallback(
    (streamName: string) => {
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

export default connect<SelectorProps, _, _>((state, props) => ({
  subscriptions: getSubscribedStreams(state),
  unreadByStream: getUnreadByStream(state),
}))(SubscriptionsCard);
