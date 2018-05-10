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
