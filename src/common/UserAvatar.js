/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { Image, View, PixelRatio } from 'react-native';

import { useSelector } from '../react-redux';
import { getAuthHeaders } from '../api/transport';
import { getAuth } from '../account/accountsSelectors';
import Touchable from './Touchable';
import { AvatarURL, FallbackAvatarURL } from '../utils/avatar';
import { IconUserMuted } from './Icons';
import { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  avatarUrl: AvatarURL,
  size: number,
  isMuted?: boolean,
  children?: Node,
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
function UserAvatar(props: Props): Node {
  const { avatarUrl, children, size, isMuted = false, onPress } = props;
  const borderRadius = size / 8;
  const style = {
    height: size,
    width: size,
    borderRadius,
  };
  const iconStyle = {
    height: size,
    width: size,
    textAlign: 'center',
  };

  const { color } = useContext(ThemeContext);

  const auth = useSelector(state => getAuth(state));

  return (
    <Touchable onPress={onPress}>
      <View accessibilityIgnoresInvertColors>
        {!isMuted ? (
          <Image
            source={{
              uri: avatarUrl.get(PixelRatio.getPixelSizeForLayoutSize(size)).toString(),
              ...(avatarUrl instanceof FallbackAvatarURL
                ? { headers: getAuthHeaders(auth) }
                : undefined),
            }}
            style={style}
            resizeMode="cover"
          />
        ) : (
          <IconUserMuted size={size} color={color} style={iconStyle} />
        )}
        {children}
      </View>
    </Touchable>
  );
}

export default UserAvatar;
