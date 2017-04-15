import React from 'react';
import { TouchableNativeFeedback, Platform, TouchableOpacity } from 'react-native';
import { HIGHLIGHT_COLOR } from './styles';

const background = Platform.Version >= 21 ?
  TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR) :
  TouchableNativeFeedback.SelectableBackground();

export default (props) => (
  <TouchableOpacity
    background={background}
    {...props}
  >
    {props.children}
  </TouchableOpacity>
);
