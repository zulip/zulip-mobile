/* @flow strict-local */
import React, { type ComponentType, PureComponent } from 'react';

import { createStyleSheet } from '../styles';
import type { Dispatch } from '../types';
import UserAvatar from './UserAvatar';
import PresenceStatusIndicator from './PresenceStatusIndicator';
import { AvatarURL } from '../utils/avatar';
import { getUserForId } from '../users/userSelectors';
import { connect } from '../react-redux';

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
// The underlying class gets an inexact Props type to express that it's fine
// for it to be passed extra props by the implementation of …ById.
// We don't export it with that type, because we want exact Props types to
// get the most effective type-checking.
class UserAvatarWithPresence extends PureComponent<$ReadOnly<{ ...Props, ... }>> {
  render() {
    const { avatarUrl, email, size, onPress } = this.props;

    return (
      <UserAvatar avatarUrl={avatarUrl} size={size} onPress={onPress}>
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

// Export the class with a tighter constraint on acceptable props, namely
// that the type is an exact object type as usual.
export default (UserAvatarWithPresence: ComponentType<Props>);

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
export const UserAvatarWithPresenceById = connect<{| avatarUrl: AvatarURL, email: string |}, _, _>(
  (state, props) => {
    const user = getUserForId(state, props.userId);
    return { avatarUrl: user.avatar_url, email: user.email };
  },
)(
  // The type inference embedded in our `connect` type relies on seeing the
  // exact Props type for the underlying component, complete with all the
  // expected props.  Normally that's just how our Props types are in the
  // first place, but here we have to provide it explicitly.
  /* eslint-disable flowtype/generic-spacing */
  (UserAvatarWithPresence: ComponentType<
    $ReadOnly<{| ...Props, dispatch: Dispatch, userId: number |}>,
  >),
);
