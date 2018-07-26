/* @flow */
import React, { PureComponent } from 'react';
import { TouchableHighlight, TouchableNativeFeedback, Platform, View } from 'react-native';

import type { ChildrenArray, Style } from '../types';
import { HIGHLIGHT_COLOR } from '../styles';

const androidBackground =
  Platform.Version >= 21
    ? TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR)
    : TouchableNativeFeedback.SelectableBackground();

type Props = {
  accessibilityLabel?: string,
  style?: Style,
  children?: ChildrenArray<*>,
  onPress?: () => void | Promise<any>,
  onLongPress?: () => void,
};

/**
 * Component to encapsulate our custom and platform-specific
 * settings applied to the built-in touchable components.
 *
 * @prop [style] - Style to apply to the underlying Touchable component.
 * @prop [children] - Components to turn into 'touchable' ones.
 * @prop [onPress] - Event fired on pressing the contained components.
 * @prop [onLongPress] - Event fired on a long press.
 */
export default class Touchable extends PureComponent<Props> {
  props: Props;

  render() {
    const { accessibilityLabel, style, children, onPress, onLongPress } = this.props;

    if (!onPress && !onLongPress) {
      return (
        <View
          accessible={!!accessibilityLabel}
          accessibilityLabel={accessibilityLabel}
          style={style}
        >
          <View>{children}</View>
        </View>
      );
    }

    if (Platform.OS === 'ios') {
      return (
        <TouchableHighlight
          accessibilityLabel={accessibilityLabel}
          underlayColor={HIGHLIGHT_COLOR}
          style={style}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          <View>{children}</View>
        </TouchableHighlight>
      );
    }

    return (
      <TouchableNativeFeedback
        accessibilityLabel={accessibilityLabel}
        style={style}
        background={androidBackground}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View>{children}</View>
      </TouchableNativeFeedback>
    );
  }
}
