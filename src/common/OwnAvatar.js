/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { GlobalState, User } from '../types';
import { getCurrentRealm, getSelfUserDetail } from '../selectors';
import ImageAvatar from './ImageAvatar';
import { getFullUrl } from '../utils/url';
import { getGravatarFromEmail } from '../utils/avatar';

type Props = {|
  user: User,
  size: number,
  realm: string,
|};

/**
 * Renders an image of the current user's avatar
 *
 * @prop size - Sets width and height in pixels.
 */
class OwnAvatar extends PureComponent<Props> {
  render() {
    const { user, size, realm } = this.props;
    const fullAvatarUrl =
      typeof user.avatar_url === 'string'
        ? getFullUrl(user.avatar_url, realm)
        : getGravatarFromEmail(user.email);

    return <ImageAvatar avatarUrl={fullAvatarUrl} size={size} shape="circle" />;
  }
}

export default connect((state: GlobalState) => ({
  realm: getCurrentRealm(state),
  user: getSelfUserDetail(state),
}))(OwnAvatar);
