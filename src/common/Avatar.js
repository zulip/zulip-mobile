/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { nullFunction } from '../nullObjects';
import { getCurrentRealm } from '../selectors';
import ImageAvatar from './ImageAvatar';
import TextAvatar from './TextAvatar';
import { getFullUrl } from '../utils/url';

class Avatar extends PureComponent {
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
    onPress: nullFunction,
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

export default connect(
  state => ({
    realm: getCurrentRealm(state),
  }),
  boundActions,
)(Avatar);
