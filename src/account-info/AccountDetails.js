/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import Emoji from '../emoji/Emoji';
import { emojiTypeFromReactionType } from '../emoji/data';
import type { LocalizableText, UserOrBot } from '../types';
import styles, { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import UserAvatar from '../common/UserAvatar';
import ComponentList from '../common/ComponentList';
import ZulipText from '../common/ZulipText';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import PresenceStatusIndicator from '../common/PresenceStatusIndicator';
import { getDisplayEmailForUser } from '../selectors';
import { Role } from '../api/permissionsTypes';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { getOwnUserId } from '../users/userSelectors';
import { getOwnUserRole } from '../permissionSelectors';

const componentStyles = createStyleSheet({
  componentListItem: {
    alignItems: 'center',
  },
  statusWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  presenceStatusIndicator: {
    position: 'relative',
    top: 2,
    marginRight: 5,
  },
  statusText: {
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

type Props = $ReadOnly<{|
  user: UserOrBot,
  showEmail: boolean,
  showStatus: boolean,
|}>;

const getRoleText = (role: Role): LocalizableText => {
  switch (role) {
    case Role.Owner:
      return 'Owner';
    case Role.Admin:
      return 'Admin';
    case Role.Moderator:
      return 'Moderator';
    case Role.Member:
      return 'Member';
    case Role.Guest:
      return 'Guest';
  }
};

export default function AccountDetails(props: Props): Node {
  const { user, showEmail, showStatus } = props;

  const userStatusText = useSelector(state => getUserStatus(state, props.user.user_id).status_text);
  const userStatusEmoji = useSelector(
    state => getUserStatus(state, props.user.user_id).status_emoji,
  );
  const realm = useSelector(state => state.realm);
  const displayEmail = getDisplayEmailForUser(realm, user);
  const ownUserId = useSelector(getOwnUserId);
  const ownUserRole = useSelector(getOwnUserRole);

  // user.role will be missing when the server has feature level <59. For
  // those old servers, we can use getOwnUserRole for the "own" (or "self")
  // user's role, but nothing will give us the role of a non-"own" user, so
  // we just won't show any role in that case.
  // TODO(server-4.0): user.role will never be missing; use that for "own"
  //   and non-"own" users.
  const role = user.user_id === ownUserId ? ownUserRole : user.role;

  return (
    <ComponentList outerSpacing itemStyle={componentStyles.componentListItem}>
      <View>
        <UserAvatar avatarUrl={user.avatar_url} size={200} />
      </View>
      <View style={componentStyles.statusWrapper}>
        <PresenceStatusIndicator
          style={componentStyles.presenceStatusIndicator}
          userId={user.user_id}
          hideIfOffline={false}
          useOpaqueBackground={false}
        />
        <ZulipText
          selectable
          style={[styles.largerText, componentStyles.boldText]}
          text={user.full_name}
        />
      </View>
      {displayEmail !== null && showEmail && (
        <View>
          <ZulipText selectable style={styles.largerText} text={displayEmail} />
        </View>
      )}
      {
        // TODO(server-4.0): Remove conditional; we'll always know the role.
        role != null && (
          <View>
            <ZulipTextIntl selectable style={styles.largerText} text={getRoleText(role)} />
          </View>
        )
      }
      {showStatus && (
        <View style={componentStyles.statusWrapper}>
          {userStatusEmoji && (
            <Emoji
              code={userStatusEmoji.emoji_code}
              type={emojiTypeFromReactionType(userStatusEmoji.reaction_type)}
              size={24}
            />
          )}
          {userStatusEmoji && userStatusText !== null && <View style={{ width: 2 }} />}
          {userStatusText !== null && (
            <ZulipText
              style={[styles.largerText, componentStyles.statusText]}
              text={userStatusText}
            />
          )}
        </View>
      )}
    </ComponentList>
  );
}
