/* @flow strict-local */

import React, { PureComponent } from 'react';
import { PixelRatio } from 'react-native';

import type { Dispatch, Message, User, CrossRealmBot } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getCurrentRealm } from '../selectors';
import UserAvatar from './UserAvatar';
import { getAvatarUrl } from '../utils/avatar';
import PresenceStatusIndicator from './PresenceStatusIndicator';

const styles = createStyleSheet({
  status: {
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  avatarUrl: | $PropertyType<Message, 'avatar_url'>
    | $PropertyType<User, 'avatar_url'>
    | $PropertyType<CrossRealmBot, 'avatar_url'>,
  email: string,
  size: number,
  realm: URL,
  shape: 'rounded' | 'square',
  onPress?: () => void,
|}>;

/**
 * Renders a user avatar with a PresenceStatusIndicator in the corner
 *
 * @prop [avatarUrl] - `.avatar_url` on a `Message` or a `UserOrBot`
 * @prop [email] - User's' email address, to calculate Gravatar URL if not given `avatarUrl`.
 * @prop [size] - Sets width and height in logical pixels.
 * @prop [realm] - Current realm url, used if avatarUrl is relative.
 * @prop [shape] - 'rounded' (default) means a square with rounded corners.
 * @prop [onPress] - Event fired on pressing the component.
 */
class UserAvatarWithPresence extends PureComponent<Props> {
  static defaultProps = {
    avatarUrl: '',
    email: '',
    shape: 'rounded',
  };

  render() {
    const { avatarUrl, email, size, onPress, realm, shape } = this.props;
    const fullAvatarUrl = getAvatarUrl(
      avatarUrl,
      email,
      realm,
      PixelRatio.getPixelSizeForLayoutSize(size),
    );

    return (
      <UserAvatar avatarUrl={fullAvatarUrl} size={size} onPress={onPress} shape={shape}>
        <PresenceStatusIndicator style={styles.status} email={email} hideIfOffline />
      </UserAvatar>
    );
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(UserAvatarWithPresence);
