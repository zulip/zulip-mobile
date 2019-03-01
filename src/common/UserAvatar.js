/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ImageBackground, View } from 'react-native';

import type { React$Node } from '../types';
import Touchable from './Touchable';

type Props = {
  avatarUrl: string,
  size: number,
  shape: string,
  children?: React$Node,
  onPress?: () => void,
};

/**
 * Renders an image of the user's avatar.
 *
 * @prop avatarUrl - Absolute or relative url to an avatar image.
 * @prop size - Sets width and height in pixels.
 * @prop shape - One of 'square', 'rounded', 'circle'.
 * @prop [children] - If provided, will render inside the component body.
 * @prop [onPress] - Event fired on pressing the component.
 */
export default class UserAvatar extends PureComponent<Props> {
  static defaultProps = {
    shape: 'rounded',
  };

  render() {
    const { avatarUrl, children, size, shape, onPress } = this.props;
    const touchableStyle = {
      height: size,
      width: size,
    };

    const borderRadius =
      shape === 'rounded' ? size / 8 : shape === 'circle' ? size / 2 : shape === 'square' ? 0 : 0;

    return (
      <View>
        <Touchable onPress={onPress} style={touchableStyle}>
          <ImageBackground
            style={touchableStyle}
            source={{ uri: avatarUrl }}
            resizeMode="cover"
            borderRadius={borderRadius}
          >
            {children}
          </ImageBackground>
        </Touchable>
      </View>
    );
  }
}
