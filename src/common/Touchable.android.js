/* @flow */
import React from 'react';
import { TouchableNativeFeedback, Platform, View } from 'react-native';

import type { ChildrenArray, Style } from '../types';
import { HIGHLIGHT_COLOR } from '../styles';

const background =
  Platform.Version >= 21
    ? TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR)
    : TouchableNativeFeedback.SelectableBackground();

type Props = {
  onPress?: () => void | Promise<any>,
  onLongPress?: () => void,
  style?: Style,
  children?: ChildrenArray<*>,
};

/**
 * Component to encapsulate our custom and platform-specific
 * settings applied to the built-in touchable components.
 *
 * @prop [style] - Style to apply to the underlying Touchable component.
 * @prop [children] - Components to turn into 'touchable' ones.
 * @prop [onPress] - Evnet fired on pressing the contained components.
 * @prop [onLongPress] - Event fired on a long press.
 */
export default ({ onPress, style, children, onLongPress }: Props) => {
  const WrapperComponent = onPress || onLongPress ? TouchableNativeFeedback : View;

  return (
    <WrapperComponent background={background} onPress={onPress} onLongPress={onLongPress}>
      <View style={style}>{children}</View>
    </WrapperComponent>
  );
};
