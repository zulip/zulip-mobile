import React from 'react';
import {TouchableHighlight} from 'react-native';
import {HIGHLIGHT_COLOR} from './styles';

export default props => (
  <TouchableHighlight underlayColor={HIGHLIGHT_COLOR} {...props}>
    {props.children}
  </TouchableHighlight>
);
