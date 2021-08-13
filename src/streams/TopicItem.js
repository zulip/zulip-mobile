/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';
import invariant from 'invariant';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles, { BRAND_COLOR, createStyleSheet } from '../styles';
import { RawLabel, Touchable, UnreadCount } from '../common';
import { showTopicActionSheet } from '../message/messageActionSheet';
import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';
import { TranslationContext } from '../boot/TranslationProvider';
import { useDispatch, useSelector } from '../react-redux';
import {
  getAuth,
  getMute,
  getFlags,
  getSubscriptions,
  getStreamsById,
  getStreamsByName,
  getOwnUser,
} from '../selectors';
import { getUnread } from '../unread/unreadModel';

const componentStyles = createStyleSheet({
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  label: {
    flex: 1,
  },
  selectedText: {
    color: 'white',
  },
  muted: {
    opacity: 0.5,
  },
});

type Props = $ReadOnly<{|
  streamName: string,
  name: string,
  isMuted?: boolean,
  isSelected?: boolean,
  unreadCount?: number,
  onPress: (stream: string, topic: string) => void,
|}>;

/**
 * A list item to show a topic with its unread count.
 *
 * Pads the horizontal insets with its background.
 */
export default function TopicItem(props: Props): Node {
  const { name, streamName, isMuted = false, isSelected = false, unreadCount = 0, onPress } = props;

  const showActionSheetWithOptions: ShowActionSheetWithOptions = useActionSheet()
    .showActionSheetWithOptions;
  const _ = useContext(TranslationContext);
  const dispatch = useDispatch();
  const backgroundData = useSelector(state => ({
    auth: getAuth(state),
    mute: getMute(state),
    streams: getStreamsById(state),
    streamsByName: getStreamsByName(state),
    subscriptions: getSubscriptions(state),
    unread: getUnread(state),
    ownUser: getOwnUser(state),
    flags: getFlags(state),
  }));

  const stream = backgroundData.streamsByName.get(streamName);
  invariant(stream !== undefined, 'No stream with provided stream name was found.');

  return (
    <Touchable
      onPress={() => onPress(streamName, name)}
      onLongPress={() => {
        showTopicActionSheet({
          showActionSheetWithOptions,
          callbacks: { dispatch, _ },
          backgroundData,
          streamId: stream.stream_id,
          topic: name,
        });
      }}
    >
      <SafeAreaView
        mode="padding"
        edges={['right', 'left']}
        style={[
          styles.listItem,
          isSelected && componentStyles.selectedRow,
          isMuted && componentStyles.muted,
        ]}
      >
        <RawLabel
          style={[componentStyles.label, isSelected && componentStyles.selectedText]}
          text={name}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
        <UnreadCount count={unreadCount} inverse={isSelected} />
      </SafeAreaView>
    </Touchable>
  );
}
