/* @flow */
import React from 'react';
import { TouchableHighlight, View } from 'react-native';

import type { ChildrenArray, Style } from '../types';
import { HIGHLIGHT_COLOR } from '../styles';

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
  const WrapperComponent = onPress || onLongPress ? TouchableHighlight : View;

  return (
    <WrapperComponent
      underlayColor={HIGHLIGHT_COLOR}
      style={style}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View>{children}</View>
    </WrapperComponent>
  );
};
