/* @flow */
import React from 'react';
import { TouchableHighlight, View } from 'react-native';

import type { StyleObj } from '../types';
import { HIGHLIGHT_COLOR } from '../styles';

type Props = {
  onPress?: () => void | Promise<any>,
  onLongPress?: () => void,
  style?: StyleObj,
  children?: [],
};

export default ({ onPress, style, children, onLongPress }: Props) =>
  <TouchableHighlight
    underlayColor={HIGHLIGHT_COLOR}
    style={style}
    onPress={onPress}
    onLongPress={onLongPress}>
    <View>
      {children}
    </View>
  </TouchableHighlight>;
