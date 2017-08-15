/* @flow */
import React, { PureComponent } from 'react';
import { ImageBackground } from 'react-native';

import { nullFunction } from '../nullObjects';
import { Touchable } from './';

export default class ImageAvatar extends PureComponent {
  props: {
    avatarUrl: string,
    size: number,
    shape: string,
    onPress: () => void,
  };

  static defaultProps = {
    onPress: nullFunction,
  };

  render() {
    const { avatarUrl, size, shape, onPress } = this.props;
    const touchableStyle = {
      height: size,
      width: size,
    };

    const borderRadius =
      shape === 'rounded' ? size / 8 : shape === 'circle' ? size / 2 : shape === 'square' ? 0 : 0;

    return (
      <Touchable onPress={onPress} style={touchableStyle}>
        <ImageBackground
          style={touchableStyle}
          source={{ uri: avatarUrl }}
          resizeMode="cover"
          borderRadius={borderRadius}
        />
      </Touchable>
    );
  }
}
