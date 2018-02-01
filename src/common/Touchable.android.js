/* @flow */
import React from 'react';
import { TouchableNativeFeedback, Platform, View } from 'react-native';

import type { ChildrenArray, StyleObj } from '../types';
import { HIGHLIGHT_COLOR } from '../styles';

const background =
  Platform.Version >= 21
    ? TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR)
    : TouchableNativeFeedback.SelectableBackground();

type Props = {
  onPress?: () => void | Promise<any>,
  onLongPress?: () => void,
  style?: StyleObj,
  children?: ChildrenArray<*>,
};

export default ({ onPress, style, children, onLongPress }: Props) => {
  const WrapperComponent = onPress || onLongPress ? TouchableNativeFeedback : View;

  return (
    <WrapperComponent background={background} onPress={onPress} onLongPress={onLongPress}>
      <View style={style}>{children}</View>
    </WrapperComponent>
  );
};
