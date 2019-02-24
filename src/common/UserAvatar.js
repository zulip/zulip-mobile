/* @flow strict-local */
import React, { PureComponent } from 'react';
import { ImageBackground, View } from 'react-native';
import { connect } from 'react-redux';

import type { ChildrenArray, GlobalState } from '../types';
import { getCurrentRealm } from '../selectors';
import Touchable from './Touchable';
import { getFullUrl } from '../utils/url';
import { getGravatarFromEmail, getMediumAvatar } from '../utils/avatar';
import ProgressiveImage from './ProgressiveImage';

type Props = {
  email: string,
  realm: string,
  size: number,
  shape: string,
  useProgressiveImage: boolean,
  avatarUrl: ?string,
  children?: ChildrenArray<*>,
  onPress?: () => void,
};

/**
 * Renders an image of the user's avatar.
 *
 * @prop avatarUrl - Absolute or relative url to an avatar image.
 * @prop size - Sets width and height in pixels.
 * @prop shape - One of 'square', 'rounded', 'circle'.
 * @prop [email] - User's' email address, to calculate Gravatar URL if not given `avatarUrl`.
 * @prop [realm] - Current realm url, used if avatarUrl is relative.
 * @prop [children] - If provided, will render inside the component body.
 * @prop [onPress] - Event fired on pressing the component.
 */
class UserAvatar extends PureComponent<Props> {
  static defaultProps = {
    shape: 'rounded',
    useProgressiveImage: false,
  };

  render() {
    const {
      avatarUrl,
      children,
      email,
      realm,
      size,
      shape,
      onPress,
      useProgressiveImage,
    } = this.props;
    const touchableStyle = {
      height: size,
      width: size,
    };

    const borderRadius =
      shape === 'rounded' ? size / 8 : shape === 'circle' ? size / 2 : shape === 'square' ? 0 : 0;

    if (!children && useProgressiveImage) {
      let thumbnailSource;
      let source;

      if (typeof avatarUrl === 'string') {
        thumbnailSource = getFullUrl(avatarUrl, realm);
        source = getMediumAvatar(thumbnailSource);
      } else {
        thumbnailSource = getGravatarFromEmail(email, size / 8);
        source = getGravatarFromEmail(email, size);
      }
      return (
        <ProgressiveImage
          thumbnailSource={thumbnailSource}
          source={source}
          style={[touchableStyle]}
        />
      );
    }

    const fullAvatarUrl =
      typeof avatarUrl === 'string' ? getFullUrl(avatarUrl, realm) : getGravatarFromEmail(email);

    return (
      <View>
        <Touchable onPress={onPress} style={touchableStyle}>
          <ImageBackground
            style={touchableStyle}
            source={{ uri: fullAvatarUrl }}
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

export default connect((state: GlobalState) => ({
  realm: getCurrentRealm(state),
}))(UserAvatar);
