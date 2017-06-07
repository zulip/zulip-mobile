/* @flow */
import React from 'react';
import { TouchableNativeFeedback, Platform, View } from 'react-native';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import { HIGHLIGHT_COLOR } from '../styles';

const background = Platform.Version >= 21 ?
  TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR) :
  TouchableNativeFeedback.SelectableBackground();

type Props = {
  onPress?: () => void | Promise<any>,
  style?: StyleObj,
  children?: [],
};

export default ({ onPress, style, children }: Props) => (
  <TouchableNativeFeedback
    style={style}
    background={background}
    onPress={onPress}
  >
    <View>
      {children}
    </View>
  </TouchableNativeFeedback>
);
