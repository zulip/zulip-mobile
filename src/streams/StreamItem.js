/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { BRAND_COLOR } from '../styles';
import { RawLabel, Touchable, UnreadCount, ZulipSwitch } from '../common';
import { foregroundColorFromBackground } from '../utils/color';
import StreamIcon from './StreamIcon';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 50,
    padding: 8,
  },
  selectedRow: {
    backgroundColor: BRAND_COLOR,
  },
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

type Props = {
  name: string,
  description?: string,
  iconSize: number,
  isMuted?: boolean,
  isPrivate?: boolean,
  isSelected?: boolean,
  showSwitch?: boolean,
  color?: string,
  backgroundColor?: string,
  isSwitchedOn?: boolean,
  unreadCount?: number,
  onPress: (name: string) => void,
  onSwitch?: (name: string, newValue: boolean) => void,
};

export default class StreamItem extends PureComponent<Props> {
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handlePress = () => this.props.onPress(this.props.name);

  handleSwitch = (newValue: boolean) => {
    const { name, onSwitch } = this.props;
    if (onSwitch) {
      onSwitch(name, newValue);
    }
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
      isSelected,
      showSwitch,
      isSwitchedOn,
      unreadCount,
    } = this.props;

    const wrapperStyle = [
      styles.row,
      { backgroundColor },
      isSelected && styles.selectedRow,
      isMuted && styles.muted,
    ];
    const iconColor = isSelected
      ? 'white'
      : backgroundColor
        ? foregroundColorFromBackground(backgroundColor)
        : color;
    const textColorStyle = isSelected
      ? { color: 'white' }
      : backgroundColor
        ? { color: foregroundColorFromBackground(backgroundColor) }
        : this.context.styles.color;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={wrapperStyle}>
          <StreamIcon size={iconSize} color={iconColor} isMuted={isMuted} isPrivate={isPrivate} />
          <View style={styles.text}>
            <RawLabel numberOfLines={1} style={textColorStyle} text={name} ellipsizeMode="tail" />
            {!!description && (
              <RawLabel
                numberOfLines={1}
                style={styles.description}
                text={description}
                ellipsizeMode="tail"
              />
            )}
          </View>
          {unreadCount && (
            <UnreadCount color={iconColor} count={unreadCount} inverse={isSelected} />
          )}
          {showSwitch && (
            <ZulipSwitch
              defaultValue={!!isSwitchedOn}
              onValueChange={this.handleSwitch}
              disabled={!isSwitchedOn && isPrivate}
            />
          )}
        </View>
      </Touchable>
    );
  }
}
