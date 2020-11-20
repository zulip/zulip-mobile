/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Message, User, CrossRealmBot } from '../types';
import { createStyleSheet } from '../styles';
import UserAvatar from './UserAvatar';
import PresenceStatusIndicator from './PresenceStatusIndicator';

const styles = createStyleSheet({
  status: {
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

type Props = $ReadOnly<{|
  avatarUrl: | $PropertyType<Message, 'avatar_url'>
    | $PropertyType<User, 'avatar_url'>
    | $PropertyType<CrossRealmBot, 'avatar_url'>,
  email: string,
  size: number,
  shape: 'rounded' | 'square',
  onPress?: () => void,
|}>;

/**
 * Renders a user avatar with a PresenceStatusIndicator in the corner
 *
 * @prop [avatarUrl] - `.avatar_url` on a `Message` or a `UserOrBot`
 * @prop [email] - Sender's / user's email address, for the presence dot.
 * @prop [size] - Sets width and height in logical pixels.
 * @prop [shape] - 'rounded' (default) means a square with rounded corners.
 * @prop [onPress] - Event fired on pressing the component.
 */
export default class UserAvatarWithPresence extends PureComponent<Props> {
  static defaultProps = {
    // TODO: An empty-string `email` is probably up to no good. Remove
    // this default.
    email: '',
    shape: 'rounded',
  };

  render() {
    const { avatarUrl, email, size, onPress, shape } = this.props;

    return (
      <UserAvatar avatarUrl={avatarUrl} email={email} size={size} onPress={onPress} shape={shape}>
        <PresenceStatusIndicator style={styles.status} email={email} hideIfOffline />
      </UserAvatar>
    );
  }
}
