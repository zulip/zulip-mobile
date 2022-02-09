/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

import { showStreamActionSheet } from '../action-sheets';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import { TranslationContext } from '../boot/TranslationProvider';
import { useDispatch, useSelector } from '../react-redux';
import {
  getAuth,
  getFlags,
  getSubscriptionsById,
  getStreamsById,
  getOwnUser,
  getSettings,
} from '../selectors';
import styles, { createStyleSheet, ThemeContext } from '../styles';
import { ZulipText, Touchable, UnreadCount, ZulipSwitch } from '../common';
import { foregroundColorFromBackground } from '../utils/color';
import StreamIcon from './StreamIcon';

const componentStyles = createStyleSheet({
  description: {
    opacity: 0.75,
    fontSize: 12,
  },
  text: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },
  muted: {
    opacity: 0.5,
  },
});

type Props = $ReadOnly<{|
  name: string,
  streamId: number,
  description?: string,
  isMuted: boolean,
  isPrivate: boolean,
  isSubscribed?: boolean,
  isWebPublic: boolean | void,
  color?: string,
  backgroundColor?: string,

  unreadCount?: number,
  iconSize: number,
  showSwitch?: boolean,
  // These stream names are here for a mix of good reasons and (#3918) bad ones.
  // To audit all uses, change `name` to write-only (`-name:`), and run Flow.
  onPress: ({ stream_id: number, name: string, ... }) => void,
  onSwitch?: ({ stream_id: number, name: string, ... }, newValue: boolean) => void,
|}>;

/**
 * A single-line list item to show a stream or stream subscription.
 *
 * Many of the props must correspond to certain properties of a Stream or
 * Subscription.
 *
 * @prop name - the stream's name
 * @prop description - the stream's description
 * @prop isMuted - false for a Stream; !sub.in_home_view for Subscription
 * @prop isPrivate - .invite_only for a Stream or a Subscription
 * @prop isSubscribed - whether the user is subscribed to the stream;
 *   ignored (and can be any value) unless showSwitch is true
 * @prop color - if provided, MUST be .color on a Subscription
 * @prop backgroundColor - if provided, MUST be .color on a Subscription
 *
 * @prop unreadCount - number of unread messages
 * @prop iconSize
 * @prop showSwitch - whether to show a toggle switch (ZulipSwitch)
 * @prop onPress - press handler for the item
 * @prop onSwitch - if switch exists
 */
export default function StreamItem(props: Props): Node {
  const {
    streamId,
    name,
    description,
    color,
    backgroundColor,
    isPrivate,
    isMuted,
    isWebPublic,
    isSubscribed = false,
    iconSize,
    showSwitch = false,
    unreadCount,
    onPress,
    onSwitch,
  } = props;

  const showActionSheetWithOptions: ShowActionSheetWithOptions = useActionSheet()
    .showActionSheetWithOptions;
  const _ = useContext(TranslationContext);
  const dispatch = useDispatch();
  const backgroundData = useSelector(state => ({
    auth: getAuth(state),
    ownUser: getOwnUser(state),
    streams: getStreamsById(state),
    subscriptions: getSubscriptionsById(state),
    flags: getFlags(state),
    userSettingStreamNotification: getSettings(state).streamNotification,
  }));

  const { backgroundColor: themeBackgroundColor, color: themeColor } = useContext(ThemeContext);

  const wrapperStyle = [styles.listItem, { backgroundColor }, isMuted && componentStyles.muted];
  const iconColor =
    color !== undefined
      ? color
      : foregroundColorFromBackground(
          backgroundColor !== undefined ? backgroundColor : themeBackgroundColor,
        );
  const textColor =
    backgroundColor !== undefined
      ? (foregroundColorFromBackground(backgroundColor): string)
      : themeColor;

  return (
    <Touchable
      onPress={() => onPress({ stream_id: streamId, name })}
      onLongPress={() => {
        showStreamActionSheet({
          showActionSheetWithOptions,
          callbacks: { dispatch, _ },
          backgroundData,
          streamId,
        });
      }}
    >
      <View style={wrapperStyle}>
        <StreamIcon
          size={iconSize}
          color={iconColor}
          isMuted={isMuted}
          isPrivate={isPrivate}
          isWebPublic={isWebPublic}
        />
        <View style={componentStyles.text}>
          <ZulipText
            numberOfLines={1}
            style={{ color: textColor }}
            text={name}
            ellipsizeMode="tail"
          />
          {description !== undefined && description !== '' && (
            <ZulipText
              numberOfLines={1}
              style={componentStyles.description}
              text={description}
              ellipsizeMode="tail"
            />
          )}
        </View>
        <UnreadCount color={iconColor} count={unreadCount} />
        {showSwitch && (
          <ZulipSwitch
            value={!!isSubscribed}
            onValueChange={(newValue: boolean) => {
              if (onSwitch) {
                onSwitch({ stream_id: streamId, name }, newValue);
              }
            }}
            disabled={!isSubscribed && isPrivate}
          />
        )}
      </View>
    </Touchable>
  );
}
