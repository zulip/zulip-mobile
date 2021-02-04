/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ThemeData } from '../styles';
import styles, { createStyleSheet, ThemeContext } from '../styles';
import { RawLabel, Touchable, UnreadCount, ZulipSwitch } from '../common';
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
  isMuted: boolean,
  isPrivate: boolean,
  color?: string,
  backgroundColor?: string,

  unreadCount?: number,
  iconSize: number,
  showSwitch: boolean,
  isSwitchedOn: boolean,
  onPress: (name: string) => void,
  onSwitch?: (name: string, newValue: boolean) => void,
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
 * @prop showSwitch - whether to show a toggle switch (ZulipSwitch)
 * @prop isSwitchedOn - initial value of the toggle switch, if present
 * @prop onPress - press handler for the item; receives the stream name
 * @prop onSwitch - if switch exists; receives stream name and new value
 */
export default class StreamItem extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  static defaultProps = {
    isMuted: false,
    isPrivate: false,
    showSwitch: false,
    isSwitchedOn: false,
  };

  render() {
    const {
      name,
      description,
      color,
      backgroundColor,
      isPrivate,
      isMuted,
      iconSize,
      showSwitch,
      isSwitchedOn,
      unreadCount,
      onPress,
      onSwitch,
    } = this.props;

    const wrapperStyle = [styles.listItem, { backgroundColor }, isMuted && componentStyles.muted];
    const iconColor =
      color !== undefined
        ? color
        : foregroundColorFromBackground(
            backgroundColor !== undefined ? backgroundColor : this.context.backgroundColor,
          );
    const textColor =
      backgroundColor !== undefined
        ? (foregroundColorFromBackground(backgroundColor): string)
        : this.context.color;

    return (
      <Touchable onPress={() => onPress(this.props.name)}>
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
          {showSwitch && (
            <ZulipSwitch
              value={!!isSwitchedOn}
              onValueChange={(newValue: boolean) => {
                if (onSwitch) {
                  onSwitch(name, newValue);
                }
              }}
              disabled={!isSwitchedOn && isPrivate}
            />
          )}
        </View>
      </Touchable>
    );
  }
}
