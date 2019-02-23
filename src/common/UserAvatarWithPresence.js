/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import UserAvatar from './UserAvatar';
import PresenceStatusIndicator from './PresenceStatusIndicator';

const componentStyles = StyleSheet.create({
  status: {
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

type Props = {|
  avatarUrl: ?string,
  email: string,
  size: number,
  shape: 'square' | 'rounded' | 'circle',
  onPress?: () => void,
|};

/**
 * Renders a user avatar with a PresenceStatusIndicator in the corner
 *
 * @prop [avatarUrl] - Absolute or relative url to an avatar image.
 * @prop [email] - User's' email address, to calculate Gravatar URL if not given `avatarUrl`.
 * @prop [size] - Sets width and height in pixels.
 * @prop [shape] - One of 'square', 'rounded', 'circle'.
 * @prop [onPress] - Event fired on pressing the component.
 */
export default class UserAvatarWithPresence extends PureComponent<Props> {
  static defaultProps = {
    avatarUrl: '',
    email: '',
    size: 32,
    shape: 'rounded',
  };

  render() {
    const { avatarUrl, email, size, onPress, shape } = this.props;

    return (
      <UserAvatar avatarUrl={avatarUrl} size={size} onPress={onPress} shape={shape} email={email}>
        <PresenceStatusIndicator style={componentStyles.status} email={email} hideIfOffline />
      </UserAvatar>
    );
  }
}
