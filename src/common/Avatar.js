/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';

import type { Presence } from '../types';
import connectWithActions from '../connectWithActions';
import { nullFunction, NULL_PRESENCE } from '../nullObjects';
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

type Props = {
  avatarUrl?: string,
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
    name: '',
    size: 32,
    presence: NULL_PRESENCE,
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

export default connectWithActions(state => ({
  realm: getCurrentRealm(state),
}))(Avatar);
