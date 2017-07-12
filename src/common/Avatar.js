/* @flow */
import React from 'react';

import ImageAvatar from './ImageAvatar';
import TextAvatar from './TextAvatar';
import { getFullUrl } from '../utils/url';

export default class Avatar extends React.PureComponent {
  props: {
    avatarUrl?: string,
    name: string,
    size: number,
    status?: string,
    realm: string,
    shape: 'square' | 'rounded' | 'circle',
    onPress?: () => void,
  };

  static defaultProps = {
    name: '',
    size: 32,
    realm: '',
    shape: 'rounded',
    onPress: () => {},
  };

  render() {
    const { avatarUrl, name, size, status, onPress, realm, shape } = this.props;

    return avatarUrl
      ? <ImageAvatar
          avatarUrl={getFullUrl(avatarUrl, realm)}
          size={size}
          status={status}
          onPress={onPress}
          shape={shape}
        />
      : <TextAvatar name={name} size={size} status={status} onPress={onPress} shape={shape} />;
  }
}
