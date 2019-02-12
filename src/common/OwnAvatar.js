/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { GlobalState, User } from '../types';
import { getCurrentRealm, getSelfUserDetail } from '../selectors';
import ImageAvatar from './ImageAvatar';
import { getAvatarFromUser } from '../utils/avatar';

type Props = {|
  user: User,
  size: number,
  realm: string,
|};

/**
 * Renders an image of the current user's avatar
 *
 * @prop [size] - Sets width and height in pixels.
 * @prop [user] - Current presence for this user used to determine status.
 * @prop [realm] - Current realm url, used if avatarUrl is relative.
 */
class OwnAvatar extends PureComponent<Props> {
  render() {
    const { user, size, realm } = this.props;
    const fullAvatarUrl = getAvatarFromUser(user, realm);
    return <ImageAvatar avatarUrl={fullAvatarUrl} size={size} shape="rounded" />;
  }
}

export default connect((state: GlobalState) => ({
  realm: getCurrentRealm(state),
  user: getSelfUserDetail(state),
}))(OwnAvatar);
