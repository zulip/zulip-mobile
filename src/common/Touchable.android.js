import React from 'react';
import { TouchableNativeFeedback, Platform } from 'react-native';
import { HIGHLIGHT_COLOR } from './styles';

const background = Platform.Version >= 21 ?
  TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR) :
  TouchableNativeFeedback.SelectableBackground();

export default (props) => (
  <TouchableNativeFeedback
    background={background}
    {...props}
  >
    {props.children}
  </TouchableNativeFeedback>
);
