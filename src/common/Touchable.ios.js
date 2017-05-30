/* @flow */
import React from 'react';
import { TouchableHighlight, View } from 'react-native';
import { HIGHLIGHT_COLOR } from '../styles';

type Props = {
  onPress?: () => void,
  style?: Object,
  children?: [],
};

export default ({ onPress, style, children }: Props) => (
  <TouchableHighlight
    underlayColor={HIGHLIGHT_COLOR}
    style={style}
    onPress={onPress}
  >
    <View>
      {children}
    </View>
  </TouchableHighlight>
);
