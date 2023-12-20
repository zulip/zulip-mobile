/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { Text, View, TouchableWithoutFeedback } from 'react-native';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import styles, { createStyleSheet } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import StreamIcon from '../streams/StreamIcon';
import { isTopicNarrow, streamIdOfNarrow, topicOfNarrow } from '../utils/narrow';
import {
  getAuth,
  getFlags,
  getSubscriptionsById,
  getStreamsById,
  getOwnUser,
  getStreamInNarrow,
  getSettings,
  getZulipFeatureLevel,
} from '../selectors';
import { getMute, isTopicFollowed } from '../mute/muteModel';
import { showStreamActionSheet, showTopicActionSheet } from '../action-sheets';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import { getUnread } from '../unread/unreadModel';
import { useNavigation } from '../react-navigation';
import { IconFollow } from '../common/Icons';

type Props = $ReadOnly<{|
  narrow: Narrow,
  color: string,
|}>;

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
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followIcon: {
    paddingLeft: 4,
    opacity: 0.4,
  },
});

export default function TitleStream(props: Props): Node {
  const { narrow, color } = props;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const stream = useSelector(state => getStreamInNarrow(state, narrow));
  const backgroundData = useSelector(state => {
    const ownUser = getOwnUser(state);
    return {
      auth: getAuth(state),
      mute: getMute(state),
      streams: getStreamsById(state),
      subscriptions: getSubscriptionsById(state),
      unread: getUnread(state),
      ownUser,
      ownUserRole: ownUser.role,
      flags: getFlags(state),
      userSettingStreamNotification: getSettings(state).streamNotification,
      zulipFeatureLevel: getZulipFeatureLevel(state),
    };
  });

  const showActionSheetWithOptions: ShowActionSheetWithOptions =
    useActionSheet().showActionSheetWithOptions;
  const _ = useContext(TranslationContext);

  const isFollowed = useSelector(
    state =>
      isTopicNarrow(narrow)
      && isTopicFollowed(streamIdOfNarrow(narrow), topicOfNarrow(narrow), getMute(state)),
  );

  return (
    <TouchableWithoutFeedback
      onLongPress={
        isTopicNarrow(narrow)
          ? () => {
              showTopicActionSheet({
                showActionSheetWithOptions,
                callbacks: { dispatch, navigation, _ },
                backgroundData,
                streamId: stream.stream_id,
                topic: topicOfNarrow(narrow),
              });
            }
          : () => {
              showStreamActionSheet({
                showActionSheetWithOptions,
                callbacks: { dispatch, navigation, _ },
                backgroundData,
                streamId: stream.stream_id,
              });
            }
      }
    >
      <View style={componentStyles.outer}>
        <View style={componentStyles.streamRow}>
          <StreamIcon
            style={styles.halfMarginRight}
            isMuted={!stream.in_home_view}
            isPrivate={stream.invite_only}
            isWebPublic={stream.is_web_public}
            color={color}
            size={styles.navTitle.fontSize}
          />
          <Text
            style={[styles.navTitle, { flex: 1, color }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {stream.name}
          </Text>
        </View>
        {isTopicNarrow(narrow) && (
          <View style={componentStyles.topicRow}>
            <Text style={[styles.navSubtitle, { color }]} numberOfLines={1} ellipsizeMode="tail">
              {topicOfNarrow(narrow)}
            </Text>
            {isFollowed && (
              <IconFollow size={14} color={color} style={componentStyles.followIcon} />
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
