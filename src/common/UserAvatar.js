/* @flow strict-local */
import React, { PureComponent, type Node as React$Node } from 'react';
import { ImageBackground, View, PixelRatio } from 'react-native';
import { connect } from '../react-redux';

import { getCurrentRealm } from '../selectors';
import { getAvatarUrl } from '../utils/avatar';
import Touchable from './Touchable';
import type { Dispatch, Message, User, CrossRealmBot } from '../types';

type SelectorProps = {|
  realm: URL,
|};

type Props = $ReadOnly<{|
  avatarUrl: | $PropertyType<Message, 'avatar_url'>
    | $PropertyType<User, 'avatar_url'>
    | $PropertyType<CrossRealmBot, 'avatar_url'>,
  email: string,
  size: number,
  shape: 'rounded' | 'square',
  children?: React$Node,
  onPress?: () => void,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

/**
 * Renders an image of the user's avatar.
 *
 * @prop avatarUrl - `.avatar_url` on a `Message` or a `UserOrBot`
 * @prop size - Sets width and height in logical pixels.
 * @prop [shape] - 'rounded' (default) means a square with rounded corners.
 * @prop [children] - If provided, will render inside the component body.
 * @prop [onPress] - Event fired on pressing the component.
 */
class UserAvatar extends PureComponent<Props> {
  static defaultProps = {
    shape: 'rounded',
  };

  render() {
    const { avatarUrl, email, realm, children, size, shape, onPress } = this.props;
    const borderRadius = shape === 'rounded' ? size / 8 : 0;
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
              uri: getAvatarUrl(
                avatarUrl,
                email,
                realm,
                PixelRatio.getPixelSizeForLayoutSize(size),
              ),
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

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(UserAvatar);
