/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';

import type { UserId } from '../types';
import { createStyleSheet } from '../styles';
import UserAvatar from './UserAvatar';
import PresenceStatusIndicator from './PresenceStatusIndicator';
import { tryGetUserForId } from '../users/userSelectors';
import { useSelector } from '../react-redux';
import { getMutedUsers } from '../directSelectors';

const styles = createStyleSheet({
  status: {
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

type Props = $ReadOnly<{|
  userId: UserId,
  size: number,
  onPress?: () => void,
|}>;

/**
 * A user avatar with a PresenceStatusIndicator in the corner.
 *
 * @prop [userId]
 * @prop [size]
 * @prop [onPress]
 */
export default function UserAvatarWithPresence(props: Props): Node {
  const { userId, size, onPress } = props;

  const user = useSelector(state => tryGetUserForId(state, userId));
  const isMuted = useSelector(getMutedUsers).has(userId);

  if (!user) {
    // This condition really does happen, because UserItem can be passed a fake
    // pseudo-user by PeopleAutocomplete, to represent `@all` or `@everyone`.
    // TODO eliminate that, and use plain `getUserForId` here.
    return null;
  }

  return (
    <UserAvatar avatarUrl={user.avatar_url} size={size} isMuted={isMuted} onPress={onPress}>
      <PresenceStatusIndicator
        style={styles.status}
        userId={user.user_id}
        hideIfOffline
        useOpaqueBackground
      />
    </UserAvatar>
  );
}
