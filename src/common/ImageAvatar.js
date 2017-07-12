/* @flow */
import React from 'react';
import { Image } from 'react-native';

import { Touchable } from './';

type Props = {
  avatarUrl: string,
  size: number,
  status?: string,
  shape: string,
  onPress?: () => void,
};

export default ({ avatarUrl, size, status, shape, onPress = () => {} }: Props) => {
  const touchableStyle = {
    height: size,
    width: size,
  };

  const imageStyle = {
    ...touchableStyle,
    borderRadius:
      shape === 'rounded' ? size / 8 : shape === 'circle' ? size / 2 : shape === 'square' ? 0 : 0,
  };

  return (
    <Touchable onPress={onPress} style={touchableStyle}>
      <Image style={imageStyle} source={{ uri: avatarUrl }} resizeMode="contain" />
    </Touchable>
  );
};
