/* @flow strict-local */
import React from 'react';

import type { User, Dispatch } from '../types';
import { connect } from '../react-redux';
import UserAvatar from './UserAvatar';
import { getOwnUser } from '../users/userSelectors';

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
function OwnAvatar(props: Props) {
  const { user, size } = props;
  return <UserAvatar avatarUrl={user.avatar_url} size={size} />;
}

export default connect(state => ({
  user: getOwnUser(state),
}))(OwnAvatar);
