/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Presence } from '../types';
import connectWithActions from '../connectWithActions';
import { nullFunction } from '../nullObjects';
import { getCurrentRealm } from '../selectors';
import ImageAvatar from './ImageAvatar';
import TextAvatar from './TextAvatar';
import { getFullUrl } from '../utils/url';
import { getGravatarFromEmail } from '../utils/avatar';
import UserStatusIndicator from '../common/UserStatusIndicator';

const componentStyles = StyleSheet.create({
  status: {
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

type Props = {
  avatarUrl: string,
  email: string,
  name: string,
  size: number,
  presence?: Presence,
  realm: string,
  shape: 'square' | 'rounded' | 'circle',
  onPress?: () => void,
};

class Avatar extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    avatarUrl: '',
    email: '',
    name: '',
    size: 32,
    realm: '',
    shape: 'rounded',
    onPress: nullFunction,
  };

  render() {
    const { avatarUrl, email, name, size, presence, onPress, realm, shape } = this.props;
    const fullAvatarUrl = avatarUrl ? getFullUrl(avatarUrl, realm) : getGravatarFromEmail(email);
    const AvatarComponent = fullAvatarUrl ? ImageAvatar : TextAvatar;

    return (
      <AvatarComponent
        name={name}
        avatarUrl={fullAvatarUrl}
        size={size}
        onPress={onPress}
        shape={shape}
      >
        <UserStatusIndicator style={componentStyles.status} presence={presence} hideIfOffline />
      </AvatarComponent>
    );
  }
}

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
}))(Avatar);
