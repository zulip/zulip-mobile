/* @flow strict-local */
import React, { PureComponent, type Node as React$Node } from 'react';
import { ImageBackground, View, PixelRatio } from 'react-native';

import Touchable from './Touchable';
import { AvatarURL } from '../utils/avatar';

type Props = $ReadOnly<{|
  avatarUrl: AvatarURL,
  size: number,
  children?: React$Node,
  onPress?: () => void,
|}>;

/**
 * Renders an image of the user's avatar.
 *
 * @prop avatarUrl
 * @prop size - Sets width and height in logical pixels.
 * @prop [children] - If provided, will render inside the component body.
 * @prop [onPress] - Event fired on pressing the component.
 */
export default class UserAvatar extends PureComponent<Props> {
  render() {
    const { avatarUrl, children, size, onPress } = this.props;
    const borderRadius = size / 8;
    const style = {
      height: size,
      width: size,
      borderRadius,
    };

    return (
      <View>
        <Touchable onPress={onPress} style={style}>
          <ImageBackground
            style={style}
            source={{
              uri: avatarUrl.get(PixelRatio.getPixelSizeForLayoutSize(size)).toString(),
            }}
            resizeMode="cover"
            /* ImageBackground seems to ignore `style.borderRadius`. */
            borderRadius={borderRadius}
          >
            {children}
          </ImageBackground>
        </Touchable>
      </View>
    );
  }
}
