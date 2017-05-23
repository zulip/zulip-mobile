/* @flow */
import React from 'react';
import { TouchableHighlight } from 'react-native';
import { HIGHLIGHT_COLOR } from '../styles';

export default (props: Object) => (
  <TouchableHighlight
    underlayColor={HIGHLIGHT_COLOR}
    {...props}
  >
    {props.children}
  </TouchableHighlight>
);
