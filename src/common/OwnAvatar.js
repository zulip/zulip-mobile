/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { GlobalState, User } from '../types';
import { getCurrentRealm, getSelfUserDetail } from '../selectors';
import UserAvatar from './UserAvatar';
import { getAvatarFromUser } from '../utils/avatar';

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
    const fullAvatarUrl = getAvatarFromUser(user, realm);
    return <UserAvatar avatarUrl={fullAvatarUrl} size={size} shape="circle" />;
  }
}

export default connect((state: GlobalState) => ({
  realm: getCurrentRealm(state),
  user: getSelfUserDetail(state),
}))(OwnAvatar);
