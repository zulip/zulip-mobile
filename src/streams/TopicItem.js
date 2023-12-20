/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

import styles, { BRAND_COLOR, createStyleSheet } from '../styles';
import { IconMention, IconFollow } from '../common/Icons';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import UnreadCount from '../common/UnreadCount';
import { showTopicActionSheet } from '../action-sheets';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import { TranslationContext } from '../boot/TranslationProvider';
import { useDispatch, useSelector } from '../react-redux';
import {
  getAuth,
  getFlags,
  getSubscriptionsById,
  getStreamsById,
  getOwnUser,
  getZulipFeatureLevel,
} from '../selectors';
import { getMute, isTopicFollowed } from '../mute/muteModel';
import { getUnread } from '../unread/unreadModel';
import { useNavigation } from '../react-navigation';
import { ThemeContext } from '../styles/theme';

const componentStyles = createStyleSheet({
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
  mentionedLabel: {
    paddingRight: 4,
    color: 'gray',
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
  followedIcon: {
    paddingLeft: 4,
    width: 20,
    opacity: 0.2,
  },
});

type Props = $ReadOnly<{|
  streamId: number,
  name: string,
  isMuted?: boolean,
  isSelected?: boolean,
  isMentioned?: boolean,
  unreadCount?: number,
  onPress: (streamId: number, topic: string) => void,
|}>;

export default function TopicItem(props: Props): Node {
  const {
    streamId,
    name,
    isMuted = false,
    isSelected = false,
    isMentioned = false,
    unreadCount = 0,
    onPress,
  } = props;

  const showActionSheetWithOptions: ShowActionSheetWithOptions =
    useActionSheet().showActionSheetWithOptions;
  const _ = useContext(TranslationContext);
  const navigation = useNavigation();
  const dispatch = useDispatch();
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
      zulipFeatureLevel: getZulipFeatureLevel(state),
    };
  });

  const theme = useContext(ThemeContext);
  const iconColor = theme.themeName === 'dark' ? 'white' : 'black';
  const isFollowed = useSelector(state => isTopicFollowed(streamId, name, getMute(state)));

  return (
    <Touchable
      onPress={() => onPress(streamId, name)}
      onLongPress={() => {
        showTopicActionSheet({
          showActionSheetWithOptions,
          callbacks: { dispatch, navigation, _ },
          backgroundData,
          streamId,
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
        <ZulipText
          style={[componentStyles.label, isSelected && componentStyles.selectedText]}
          text={name}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
        {isMentioned && <IconMention size={14} style={componentStyles.mentionedLabel} />}
        <UnreadCount count={unreadCount} inverse={isSelected} />
        {isFollowed ? (
          <IconFollow style={componentStyles.followedIcon} size={14} color={iconColor} />
        ) : (
          // $FlowFixMe[incompatible-type]: complains about `color` but that's not present
          <View style={componentStyles.followedIcon} />
        )}
      </View>
    </Touchable>
  );
}
