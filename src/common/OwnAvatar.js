/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { User, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getCurrentRealm, getSelfUserDetail } from '../selectors';
import UserAvatar from './UserAvatar';
import { getAvatarFromUser } from '../utils/avatar';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  user: User,
  size: number,
  realm: URL,
|}>;

/**
 * Renders an image of the current user's avatar
 *
 * @prop size - Sets width and height in pixels.
 */
class OwnAvatar extends PureComponent<Props> {
  render() {
    const { user, size, realm } = this.props;
    const fullAvatarUrl = getAvatarFromUser(user, realm, size);
    return <UserAvatar avatarUrl={fullAvatarUrl} size={size} />;
  }
}

export default connect(state => ({
  realm: getCurrentRealm(state),
  user: getSelfUserDetail(state),
}))(OwnAvatar);
