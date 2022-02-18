/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View, FlatList } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { StreamTabsNavigationProp } from '../main/StreamTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import { ZulipButton, LoadingBanner, SearchEmptyState } from '../common';
import * as api from '../api';
import { delay } from '../utils/async';
import { streamNarrow } from '../utils/narrow';
import { getAuth, getCanCreateStreams, getStreams } from '../selectors';
import { doNarrow, navigateToCreateStream } from '../actions';
import { caseInsensitiveCompareFunc } from '../utils/misc';
import StreamItem from '../streams/StreamItem';
import { getSubscriptionsById } from './subscriptionSelectors';

const listStyles = createStyleSheet({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type StreamListProps = $ReadOnly<{|
  onPress: (streamId: number, streamName: string) => void,
  onSwitch: (streamId: number, streamName: string, newValue: boolean) => void,
|}>;

// TODO(#3767): Simplify this by specializing to its one caller.
function StreamList(props: StreamListProps): Node {
  const { onPress, onSwitch } = props;

  const subscriptions = useSelector(getSubscriptionsById);
  const streams = useSelector(getStreams);

  if (streams.length === 0) {
    return <SearchEmptyState text="No streams found" />;
  }

  // TODO(perf): We should memoize this sorted list.
  const sortedStreams = streams.slice().sort((a, b) => caseInsensitiveCompareFunc(a.name, b.name));

  return (
    <FlatList
      style={listStyles.list}
      data={sortedStreams}
      initialNumToRender={20}
      keyExtractor={item => item.stream_id.toString()}
      renderItem={({ item }) => (
        <StreamItem
          streamId={item.stream_id}
          name={item.name}
          iconSize={16}
          isPrivate={item.invite_only}
          isWebPublic={item.is_web_public}
          description={item.description}
          color={
            /* Even if the user happens to be subscribed to this stream,
               we don't show their subscription color. */
            undefined
          }
          unreadCount={undefined}
          isMuted={
            /* This stream may in reality be muted.
               But in this UI, we don't show that distinction. */
            false
          }
          showSwitch
          isSubscribed={subscriptions.has(item.stream_id)}
          onPress={onPress}
          onSwitch={onSwitch}
        />
      )}
    />
  );
}

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
    (streamId: number) => dispatch(doNarrow(streamNarrow(streamId))),
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
      <StreamList onSwitch={handleSwitchChange} onPress={handleNarrow} />
    </View>
  );
}
