import React from 'react';
import { TouchableNativeFeedback } from 'react-native';
import { HIGHLIGHT_COLOR } from './styles';

export default (props) => (
  <TouchableNativeFeedback
    useForeground
    background={TouchableNativeFeedback.Ripple(HIGHLIGHT_COLOR)}
    {...props}
  >
    {props.children}
  </TouchableNativeFeedback>
);
