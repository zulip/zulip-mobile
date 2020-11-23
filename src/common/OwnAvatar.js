/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { User, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getSelfUserDetail } from '../selectors';
import UserAvatar from './UserAvatar';

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  user: User,
  size: number,
|}>;

/**
 * Renders an image of the current user's avatar
 *
 * @prop size - Sets width and height in logical pixels.
 */
class OwnAvatar extends PureComponent<Props> {
  render() {
    const { user, size } = this.props;
    return <UserAvatar avatarUrl={user.avatar_url} email={user.email} size={size} />;
  }
}

export default connect(state => ({
  user: getSelfUserDetail(state),
}))(OwnAvatar);
