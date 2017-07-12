/* @flow */
import React from 'react';
import { TouchableNativeFeedback, Platform, View } from 'react-native';

import type { StyleObj } from '../types';
import { HIGHLIGHT_COLOR } from '../styles';

const background =
  Platform.Version >= 21
    ? TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR)
    : TouchableNativeFeedback.SelectableBackground();

type Props = {
  onPress?: () => void | Promise<any>,
  onLongPress?: () => void,
  style?: StyleObj,
  children?: [],
};

export default ({ onPress, style, children, onLongPress }: Props) =>
  <TouchableNativeFeedback
    style={style}
    background={background}
    onPress={onPress}
    onLongPress={onLongPress}>
    <View>
      {children}
    </View>
  </TouchableNativeFeedback>;
