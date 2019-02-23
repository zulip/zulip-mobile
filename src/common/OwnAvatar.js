/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import type { GlobalState, User } from '../types';
import { getSelfUserDetail } from '../selectors';
import UserAvatar from './UserAvatar';

type Props = {|
  user: User,
  size: number,
|};

/**
 * Renders an image of the current user's avatar
 *
 * @prop size - Sets width and height in pixels.
 */
class OwnAvatar extends PureComponent<Props> {
  render() {
    const { user, size } = this.props;

    return <UserAvatar avatarUrl={user.avatar_url} size={size} shape="circle" email={user.email} />;
  }
}

export default connect((state: GlobalState) => ({
  user: getSelfUserDetail(state),
}))(OwnAvatar);
