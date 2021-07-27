/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import { useSelector } from '../react-redux';
import UserAvatar from './UserAvatar';
import { getOwnUser } from '../users/userSelectors';

type Props = $ReadOnly<{|
  size: number,
|}>;

/**
 * Renders an image of the current user's avatar
 *
 * @prop size - Sets width and height in logical pixels.
 */
export default function OwnAvatar(props: Props): Node {
  const { size } = props;
  const user = useSelector(getOwnUser);
  return <UserAvatar avatarUrl={user.avatar_url} size={size} />;
}
