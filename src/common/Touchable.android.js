/* @flow */
import React from 'react';
import { TouchableNativeFeedback, Platform, View } from 'react-native';
import { HIGHLIGHT_COLOR } from '../styles';

const background = Platform.Version >= 21 ?
  TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR) :
  TouchableNativeFeedback.SelectableBackground();

type Props = {
  onPress?: () => void,
  style?: Object,
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
