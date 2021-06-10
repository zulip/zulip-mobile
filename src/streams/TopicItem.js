/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';
import invariant from 'invariant';

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

export default function TopicItem(props: Props) {
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
          streamName,
          streamId: stream.stream_id,
          topic: name,
        });
      }}
    >
      <View
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
      </View>
    </Touchable>
  );
}
