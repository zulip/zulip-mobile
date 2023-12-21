/* @flow strict-local */
import invariant from 'invariant';
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { UserId, UserOrBot } from '../types';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import UnreadCount from '../common/UnreadCount';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import { createStyleSheet, BRAND_COLOR } from '../styles';
import { useSelector } from '../react-redux';
import { getFullNameOrMutedUserReactText, tryGetUserForId } from './userSelectors';
import { getMutedUsers } from '../selectors';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import { emojiTypeFromReactionType } from '../emoji/data';
import Emoji from '../emoji/Emoji';
import ZulipTextIntl from '../common/ZulipTextIntl';
import { getRealm } from '../directSelectors';

type Props = $ReadOnly<{|
  userId: UserId,
  isSelected?: boolean,
  showEmail?: boolean,
  unreadCount?: number,
  onPress?: UserOrBot => void,
  size?: 'large' | 'medium',
|}>;

/**
 * A user represented with avatar and name, for use in a list.
 */
export default function UserItem(props: Props): Node {
  const {
    userId,
    isSelected = false,
    onPress,
    unreadCount,
    showEmail = false,
    size = 'large',
  } = props;

  const enableGuestUserIndicator = useSelector(state => getRealm(state).enableGuestUserIndicator);

  const user = useSelector(state => tryGetUserForId(state, userId));

  const mutedUsers = useSelector(getMutedUsers);
  const isMuted = mutedUsers.has(userId);
  const userStatusEmoji = useSelector(
    state => user && getUserStatus(state, user.user_id),
  )?.status_emoji;

  // eslint-disable-next-line no-underscore-dangle
  const _handlePress = useCallback(() => {
    invariant(user, 'Callback is used only if user is known');
    invariant(onPress, 'Callback is used only if onPress provided');
    onPress(user);
  }, [onPress, user]);
  const handlePress = onPress && user ? _handlePress : undefined;

  const displayName = getFullNameOrMutedUserReactText({
    user,
    mutedUsers,
    enableGuestUserIndicator,
  });
  let displayEmail = null;
  if (user != null && !isMuted && showEmail) {
    displayEmail = user.email;
  }

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        wrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: size === 'large' ? 16 : 8,

          // Minimum touch target height:
          //   https://material.io/design/usability/accessibility.html#layout-and-typography
          minHeight: 48,
        },
        selectedRow: {
          backgroundColor: BRAND_COLOR,
        },
        text: {
          marginLeft: size === 'large' ? 16 : 8,
        },
        textWrapper: {
          flexShrink: 1,
        },
        selectedText: {
          color: 'white',
        },
        textEmail: {
          fontSize: 10,
          color: 'hsl(0, 0%, 60%)',
        },
        spacer: {
          flex: 1,
          minWidth: 4,
        },
      }),
    [size],
  );

  return (
    <Touchable onPress={onPress && handlePress}>
      <View style={[styles.wrapper, isSelected && styles.selectedRow]}>
        <UserAvatarWithPresence
          // At size medium, keep just big enough for a 48px touch target.
          size={size === 'large' ? 48 : 32}
          userId={userId}
          onPress={handlePress}
        />
        <View style={styles.textWrapper}>
          <ZulipTextIntl
            style={[styles.text, isSelected && styles.selectedText]}
            text={displayName}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          {displayEmail != null && (
            <ZulipText
              style={[styles.text, styles.textEmail, isSelected && styles.selectedText]}
              text={displayEmail}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          )}
        </View>
        {userStatusEmoji && (
          <View style={{ marginLeft: 4 }}>
            <Emoji
              code={userStatusEmoji.emoji_code}
              type={emojiTypeFromReactionType(userStatusEmoji.reaction_type)}
              // 15 is the fontSize in the user's name.
              size={size === 'large' ? 24 : 15}
            />
          </View>
        )}
        <View style={styles.spacer} />
        <UnreadCount count={unreadCount} inverse={isSelected} />
      </View>
    </Touchable>
  );
}
