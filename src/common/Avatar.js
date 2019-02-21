/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { GlobalState } from '../types';
import { getCurrentRealm } from '../selectors';
import UserAvatar from './UserAvatar';
import { getFullUrl } from '../utils/url';
import { getGravatarFromEmail } from '../utils/avatar';
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
  realm: string,
  shape: 'square' | 'rounded' | 'circle',
  onPress?: () => void,
|};

/**
 * Renders an image if avatarUrl is proved, a text avatar otherwise
 *
 * @prop [avatarUrl] - Absolute or relative url to an avatar image.
 * @prop [email] - User's' email address, to calculate Gravatar URL if not given `avatarUrl`.
 * @prop [size] - Sets width and height in pixels.
 * @prop [realm] - Current realm url, used if avatarUrl is relative.
 * @prop [shape] - One of 'square', 'rounded', 'circle'.
 * @prop [onPress] - Event fired on pressing the component.
 */
class Avatar extends PureComponent<Props> {
  static defaultProps = {
    avatarUrl: '',
    email: '',
    size: 32,
    realm: '',
    shape: 'rounded',
  };

  render() {
    const { avatarUrl, email, size, onPress, realm, shape } = this.props;
    const fullAvatarUrl =
      typeof avatarUrl === 'string' ? getFullUrl(avatarUrl, realm) : getGravatarFromEmail(email);

    return (
      <UserAvatar avatarUrl={fullAvatarUrl} size={size} onPress={onPress} shape={shape}>
        <PresenceStatusIndicator style={componentStyles.status} email={email} hideIfOffline />
      </UserAvatar>
    );
  }
}

export default connect((state: GlobalState) => ({
  realm: getCurrentRealm(state),
}))(Avatar);
