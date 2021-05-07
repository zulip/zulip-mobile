/* @flow strict-local */
import React, { type Node as React$Node } from 'react';
import { Image, View, PixelRatio } from 'react-native';

import { useSelector } from '../react-redux';
import { getAuthHeaders } from '../api/transport';
import { tryGetAuth } from '../account/accountsSelectors';
import Touchable from './Touchable';
import { AvatarURL, FallbackAvatarURL } from '../utils/avatar';

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
function UserAvatar(props: Props) {
  const { avatarUrl, children, size, onPress } = props;
  const borderRadius = size / 8;
  const style = {
    height: size,
    width: size,
    borderRadius,
  };

  const auth = useSelector(state => tryGetAuth(state));
  if (!auth) {
    // TODO: This should be impossible (and then the selector should be
    //   `getAuth` to say so.)  There's a bug where this component (probably
    //   as part of the whole main nav-tabs UI?) apparently stays mounted,
    //   and keeps getting updates, after the active account changes on
    //   choosing "Add new account", or an existing logged-out account, from
    //   the pick-accounts screen after Profile > Switch account.  See:
    //     https://github.com/zulip/zulip-mobile/issues/4388
    return null;
  }

  return (
    <View>
      <Touchable onPress={onPress}>
        <View>
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
          {children}
        </View>
      </Touchable>
    </View>
  );
}

export default UserAvatar;
