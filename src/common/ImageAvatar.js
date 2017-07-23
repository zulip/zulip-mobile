/* @flow */
import React, { PureComponent } from 'react';
import { Image } from 'react-native';

import { nullFunction } from '../nullObjects';
import { Touchable } from './';

export default class ImageAvatar extends PureComponent {
  props: {
    avatarUrl: string,
    size: number,
    shape: string,
    children: [],
    onPress?: () => void,
  };

  static defaultProps = {
    onPress: nullFunction,
  };

  render() {
    const { avatarUrl, size, shape, onPress, children } = this.props;
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
        <Image style={imageStyle} source={{ uri: avatarUrl }} resizeMode="contain">
          {children}
        </Image>
      </Touchable>
    );
  }
}
