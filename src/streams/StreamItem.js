/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';

import styles, { createStyleSheet, ThemeContext } from '../styles';
import { RawLabel, Touchable, UnreadCount, ZulipSubscribe } from '../common';
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
  description?: string,
  isMuted?: boolean,
  isPrivate?: boolean,
  color?: string,
  backgroundColor?: string,

  unreadCount?: number,
  iconSize: number,
  showToSubscribe?: boolean,
  isSubscribed?: boolean,
  onPress: (name: string) => void,
  onSubscribe?: (name: string, newValue: boolean) => void,
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
 * @prop color - if provided, MUST be .color on a Subscription
 * @prop backgroundColor - if provided, MUST be .color on a Subscription
 *
 * @prop unreadCount - number of unread messages
 * @prop iconSize
 * @prop showToSubscribe - whether to show a button to subscirbe or unsubscribe stream (ZulipSubscribe)
 * @prop isSubscribed - initial value for subscribe button, if present
 * @prop onPress - press handler for the item; receives the stream name
 * @prop onSubscribe - if (ZulipSubscribe) button exists; receives stream name and new value
 */
export default function StreamItem(props: Props) {
  const {
    name,
    description,
    color,
    backgroundColor,
    isPrivate = false,
    isMuted = false,
    iconSize,
    showToSubscribe = false,
    isSubscribed = false,
    unreadCount,
    onPress,
    onSubscribe,
  } = props;

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
    <Touchable onPress={() => onPress(name)}>
      <View style={wrapperStyle}>
        <StreamIcon size={iconSize} color={iconColor} isMuted={isMuted} isPrivate={isPrivate} />
        <View style={componentStyles.text}>
          <RawLabel
            numberOfLines={1}
            style={{ color: textColor }}
            text={name}
            ellipsizeMode="tail"
          />
          {description !== undefined && description !== '' && (
            <RawLabel
              numberOfLines={1}
              style={componentStyles.description}
              text={description}
              ellipsizeMode="tail"
            />
          )}
        </View>
        <UnreadCount color={iconColor} count={unreadCount} />
        {showToSubscribe && (
          <ZulipSubscribe
            isSubscribed={isSubscribed}
            onPress={(newValue: boolean) => {
              if (onSubscribe) {
                onSubscribe(name, newValue);
              }
            }}
            disabled={!isSubscribed && isPrivate}
          />
        )}
      </View>
    </Touchable>
  );
}
