/* @flow strict-local */
import React, { type ElementConfig, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { TranslationContext } from '../boot/TranslationProvider';
import type { UserId } from '../types';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import UnreadCount from '../common/UnreadCount';
import UserAvatarWithPresence from '../common/UserAvatarWithPresence';
import { createStyleSheet, BRAND_COLOR } from '../styles';
import { useSelector } from '../react-redux';
import { getUserForId } from './userSelectors';
import { getMutedUsers } from '../selectors';
import { getUserStatus } from '../user-statuses/userStatusesModel';
import { emojiTypeFromReactionType } from '../emoji/data';
import Emoji from '../emoji/Emoji';

type Props<UserT> = $ReadOnly<{|
  user: UserT,
  isSelected?: boolean,
  showEmail?: boolean,
  unreadCount?: number,
  onPress?: UserT => void,
  size?: 'large' | 'medium',
|}>;

/**
 * A user represented with avatar and name, for use in a list.
 *
 * Prefer the default export `UserItem` over this component: it does the
 * same thing but provides a more encapsulated interface.
 *
 * This component is potentially appropriate if displaying a synthetic fake
 * user, one that doesn't exist in the database.  (But anywhere we're doing
 * that, there's probably a better UI anyway than showing a fake user.)
 */
export function UserItemRaw<
  UserT: $ReadOnly<{ user_id: UserId, email: string, full_name: string, ... }>,
>(props: Props<UserT>): Node {
  const {
    user,
    isSelected = false,
    onPress,
    unreadCount,
    showEmail = false,
    size = 'large',
  } = props;
  const _ = useContext(TranslationContext);
  const isMuted = useSelector(getMutedUsers).has(user.user_id);
  const userStatusEmoji = useSelector(state => getUserStatus(state, user.user_id)).status_emoji;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(user);
    }
  }, [onPress, user]);

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
          userId={user.user_id}
          onPress={onPress && handlePress}
        />
        <View style={styles.textWrapper}>
          <ZulipText
            style={[styles.text, isSelected && styles.selectedText]}
            text={isMuted ? _('Muted user') : user.full_name}
            numberOfLines={1}
            ellipsizeMode="tail"
          />
          {showEmail && !isMuted && (
            <ZulipText
              style={[styles.text, styles.textEmail, isSelected && styles.selectedText]}
              text={user.email}
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

type OuterProps = $ReadOnly<{|
  ...$Exact<$Diff<ElementConfig<typeof UserItemRaw>, {| user: mixed |}>>,
  userId: UserId,
|}>;

/**
 * A user represented with avatar and name, for use in a list.
 *
 * Use this in preference to `UserItemRaw`.  That helps us better
 * encapsulate getting user data where it's needed.
 */
// eslint-disable-next-line func-names
export default function (props: OuterProps): Node {
  const { userId, ...restProps } = props;
  const user = useSelector(state => getUserForId(state, userId));
  return <UserItemRaw {...restProps} user={user} />;
}
