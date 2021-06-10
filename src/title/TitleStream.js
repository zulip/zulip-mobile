/* @flow strict-local */

import React, { useContext } from 'react';
import { Text, View, TouchableWithoutFeedback } from 'react-native';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

import { TranslationContext } from '../boot/TranslationProvider';
import type {
  Narrow,
  Stream,
  Subscription,
  Dispatch,
  Auth,
  MuteState,
  User,
  FlagsState,
} from '../types';
import styles, { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow, topicOfNarrow } from '../utils/narrow';
import {
  getAuth,
  getMute,
  getFlags,
  getSubscriptions,
  getStreamsById,
  getOwnUser,
  getStreamInNarrow,
} from '../selectors';
import { showTopicActionSheet } from '../message/messageActionSheet';
import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';

type SelectorProps = {|
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
  backgroundData: {|
    auth: Auth,
    mute: MuteState,
    streams: Map<number, Stream>,
    subscriptions: Subscription[],
    ownUser: User,
    flags: FlagsState,
  |},
|};

type Props = $ReadOnly<{|
  narrow: Narrow,
  color: string,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

const TitleStream = (props: Props) => {
  const { narrow, stream, color, dispatch, backgroundData } = props;
  const componentStyles = createStyleSheet({
    outer: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      height: '100%',
    },
    streamRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
  const showActionSheetWithOptions: ShowActionSheetWithOptions = useActionSheet()
    .showActionSheetWithOptions;
  const _ = useContext(TranslationContext);

  return (
    <TouchableWithoutFeedback
      onLongPress={
        isTopicNarrow(narrow)
          ? () => {
              showTopicActionSheet({
                showActionSheetWithOptions,
                callbacks: { dispatch, _ },
                backgroundData,
                streamName: stream.name,
                topic: topicOfNarrow(narrow),
              });
            }
          : undefined
      }
    >
      <View style={componentStyles.outer}>
        <View style={componentStyles.streamRow}>
          <StreamIcon
            style={styles.halfMarginRight}
            isMuted={!stream.in_home_view}
            isPrivate={stream.invite_only}
            color={color}
            size={20}
          />
          <Text style={[styles.navTitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {stream.name}
          </Text>
        </View>
        {isTopicNarrow(narrow) && (
          <Text style={[styles.navSubtitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
            {topicOfNarrow(narrow)}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default connect<SelectorProps, _, _>((state, props) => ({
  stream: getStreamInNarrow(state, props.narrow),
  backgroundData: {
    auth: getAuth(state),
    mute: getMute(state),
    streams: getStreamsById(state),
    subscriptions: getSubscriptions(state),
    ownUser: getOwnUser(state),
    flags: getFlags(state),
  },
}))(TitleStream);
