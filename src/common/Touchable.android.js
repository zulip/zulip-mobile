import React from 'react';
import { TouchableNativeFeedback, Platform, View } from 'react-native';
import { HIGHLIGHT_COLOR } from '../styles';

const background = Platform.Version >= 21 ?
  TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR) :
  TouchableNativeFeedback.SelectableBackground();

export default ({ onPress, style, children }) => (
  <TouchableNativeFeedback background={background} onPress={onPress}>
    <View style={style}>
      {children}
    </View>
  </TouchableNativeFeedback>
);
