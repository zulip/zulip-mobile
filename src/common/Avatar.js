/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { connect } from 'react-redux';

import type { Presence } from '../types';
import { nullFunction } from '../nullObjects';
import { getCurrentRealm } from '../selectors';
import ImageAvatar from './ImageAvatar';
import TextAvatar from './TextAvatar';
import { getFullUrl } from '../utils/url';
import UserStatusIndicator from '../common/UserStatusIndicator';

const componentStyles = StyleSheet.create({
  status: {
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

class Avatar extends PureComponent {
  props: {
    avatarUrl?: string,
    name?: string,
    size?: number,
    presence?: Presence,
    realm?: string,
    shape?: 'square' | 'rounded' | 'circle',
    onPress?: () => void,
  };

  static defaultProps = {
    name: '',
    size: 32,
    realm: '',
    shape: 'rounded',
    onPress: nullFunction,
  };

  render() {
    const { avatarUrl, name, size, presence, onPress, realm, shape } = this.props;
    const AvatarComponent = avatarUrl ? ImageAvatar : TextAvatar;
    return (
      <AvatarComponent
        name={name}
        avatarUrl={avatarUrl && getFullUrl(avatarUrl, realm)}
        size={size}
        onPress={onPress}
        shape={shape}
      >
        <UserStatusIndicator style={componentStyles.status} presence={presence} />
      </AvatarComponent>
    );
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
}))(Avatar);
