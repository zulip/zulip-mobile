/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { UserId } from '../types';
import { createStyleSheet } from '../styles';
import UserAvatar from './UserAvatar';
import PresenceStatusIndicator from './PresenceStatusIndicator';
import { AvatarURL } from '../utils/avatar';
import { tryGetUserForId } from '../users/userSelectors';
import { useSelector } from '../react-redux';

const styles = createStyleSheet({
  status: {
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

type Props = $ReadOnly<{|
  avatarUrl: AvatarURL,
  size: number,
  onPress?: () => void,
  email: string,
  isMuted?: boolean,
|}>;

/**
 * A user avatar with a PresenceStatusIndicator in the corner.
 *
 * Prefer `UserAvatarWithPresenceById` over this component: it does the same
 * thing but avoids an email in the component's interface.  Once all callers
 * have migrated to that version, it'll replace this one.
 *
 * @prop [avatarUrl]
 * @prop [email] - Sender's / user's email address, for the presence dot.
 * @prop [size] - Sets width and height in logical pixels.
 * @prop [onPress] - Event fired on pressing the component.
 */
export default class UserAvatarWithPresence extends PureComponent<Props> {
  render(): React$Node {
    const { avatarUrl, email, isMuted, size, onPress } = this.props;

    return (
      <UserAvatar avatarUrl={avatarUrl} size={size} isMuted={isMuted} onPress={onPress}>
        <PresenceStatusIndicator
          style={styles.status}
          email={email}
          hideIfOffline
          useOpaqueBackground
        />
      </UserAvatar>
    );
  }
}

/**
 * A user avatar with a PresenceStatusIndicator in the corner.
 *
 * Use this in preference to the default export `UserAvatarWithPresence`.
 * We're migrating from that one to this in order to avoid using emails.
 *
 * @prop [userId]
 * @prop [size]
 * @prop [onPress]
 */
export function UserAvatarWithPresenceById(
  props: $ReadOnly<{|
    ...$Diff<Props, {| avatarUrl: mixed, email: mixed |}>,
    userId: UserId,
  |}>,
): React$Node {
  const { userId, ...restProps } = props;

  const user = useSelector(state => tryGetUserForId(state, userId));
  if (!user) {
    // This condition really does happen, because UserItem can be passed a fake
    // pseudo-user by PeopleAutocomplete, to represent `@all` or `@everyone`.
    // TODO eliminate that, and use plain `getUserForId` here.
    return null;
  }

  return <UserAvatarWithPresence {...restProps} avatarUrl={user.avatar_url} email={user.email} />;
}
