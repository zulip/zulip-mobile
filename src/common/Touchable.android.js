import React from 'react';
import { TouchableNativeFeedback, Platform, TouchableHighlight } from 'react-native';
import { HIGHLIGHT_COLOR } from './styles';

const background = Platform.Version >= 21 ?
  TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR) :
  TouchableNativeFeedback.SelectableBackground();

export default (props) => (
  <TouchableNativeFeedback>
  <TouchableHighlight
    background={background}
    {...props}
  >
    {props.children}
  </TouchableHighlight>
  </TouchableNativeFeedback>
);
